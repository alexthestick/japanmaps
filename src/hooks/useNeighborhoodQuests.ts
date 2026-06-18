/**
 * useNeighborhoodQuests
 *
 * Loads quest-enabled neighborhood guide articles and computes the user's
 * all-time quest progress for each neighborhood.
 *
 * Data flow:
 *   1. Fetch blog_posts WHERE quest_enabled = true (lightweight — ~12 rows)
 *      Returns id, title, slug, quest_type, referenced_stores (UUID array)
 *   2. Batch-fetch store stubs (id, name, neighborhood) for all referenced
 *      store UUIDs in a single .in() query — no name matching needed
 *   3. For each neighborhood article, derive the neighborhood from the
 *      most-common `store.neighborhood` among referenced stores
 *   4. One quest per neighborhood (first article wins)
 *   5. Compute progress: how many quest store IDs are in stampedStoreIds
 *
 * Returns a Map<neighborhood, QuestProgress> for O(1) lookup in the HUD.
 *
 * Called in HomePage.tsx whenever Radar mode is active.
 * stampedStoreIds comes from useCheckinCache (all-time stamps, not session-only).
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QuestStore {
  storeId: string;
  storeName: string;
  /** Coordinates for flyToStore when tapped in QuestDetailSheet */
  latitude: number;
  longitude: number;
}

export interface QuestProgress {
  /** blog_post.id — unique quest identifier */
  questId: string;
  /** Article title for display */
  questTitle: string;
  /** Article slug for "Read guide" link → /blog/{slug} */
  questSlug: string;
  /** Neighborhood this quest is for (derived, not parsed) */
  neighborhood: string;
  /** Ordered list of quest stores (matched only) */
  questStores: QuestStore[];
  /** How many quest stores appear in the user's all-time stamps */
  stamped: number;
  /** Total matched quest stores */
  total: number;
  /** True when stamped >= total (and total > 0) */
  isComplete: boolean;
}

// ── Internal types ────────────────────────────────────────────────────────────

interface StoreStub {
  id: string;
  name: string;
  neighborhood: string | null;
  latitude: number;
  longitude: number;
}

interface QuestDef {
  questId: string;
  questTitle: string;
  questSlug: string;
  neighborhood: string;
  questStores: QuestStore[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return the most-common non-null value from an array */
function mostCommon(values: (string | null | undefined)[]): string | null {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useNeighborhoodQuests(
  stampedStoreIds: Set<string>,
): Map<string, QuestProgress> {
  // ── 1. Fetch quest-enabled articles (no sections_data — just UUID arrays) ──
  const { data: questPosts } = useQuery({
    queryKey: ['neighborhood-quests-posts-v2'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, quest_type, referenced_stores')
        .eq('quest_enabled', true)
        .not('referenced_stores', 'is', null);
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        title: string;
        slug: string;
        quest_type: string;
        referenced_stores: string[];
      }[];
    },
    staleTime: 30 * 60 * 1000, // 30 min — articles rarely change
  });

  // ── 2. Collect all unique referenced store IDs across all quest articles ───
  const allStoreIds = useMemo((): string[] => {
    if (!questPosts) return [];
    const ids = new Set<string>();
    for (const post of questPosts) {
      for (const id of (post.referenced_stores ?? [])) ids.add(id);
    }
    return [...ids].sort(); // sort for stable React Query key
  }, [questPosts]);

  // ── 3. Batch-fetch store stubs for all referenced IDs in one query ─────────
  const { data: storeStubs } = useQuery({
    queryKey: ['quest-store-stubs', allStoreIds],
    queryFn: async () => {
      if (allStoreIds.length === 0) return [];
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, neighborhood, latitude, longitude')
        .in('id', allStoreIds);
      if (error) throw error;
      // Cast through unknown: the generated types don't enumerate latitude/longitude
      // on stores even though they exist in the DB. The select string above is correct.
      return (data ?? []) as unknown as StoreStub[];
    },
    enabled: allStoreIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 min
  });

  // ── 4. Build id → stub lookup for O(1) access ─────────────────────────────
  const storeById = useMemo((): Map<string, StoreStub> => {
    if (!storeStubs) return new Map();
    return new Map(storeStubs.map((s) => [s.id, s]));
  }, [storeStubs]);

  // ── 5. Derive quest definitions (stable — not dependent on stamps) ─────────
  const questDefs = useMemo((): QuestDef[] => {
    if (!questPosts || storeById.size === 0) return [];

    const seen = new Set<string>(); // one quest per neighborhood
    const defs: QuestDef[] = [];

    for (const post of questPosts) {
      // Only neighborhood-type quests in this hook
      if (post.quest_type !== 'neighborhood') continue;

      const storeIds = post.referenced_stores ?? [];
      if (storeIds.length === 0) continue;

      // Resolve stubs — skip IDs that aren't in the DB (store deleted, etc.)
      const resolvedStubs = storeIds
        .map((id) => storeById.get(id))
        .filter((s): s is StoreStub => s !== undefined);

      if (resolvedStubs.length === 0) continue;

      // Derive neighborhood from most-common neighborhood among resolved stores
      const neighborhood = mostCommon(resolvedStubs.map((s) => s.neighborhood));
      if (!neighborhood) continue;

      // One quest per neighborhood (first article wins)
      if (seen.has(neighborhood)) continue;
      seen.add(neighborhood);

      defs.push({
        questId: post.id,
        questTitle: post.title.trim(),
        questSlug: post.slug,
        neighborhood,
        questStores: resolvedStubs.map((s) => ({
          storeId: s.id,
          storeName: s.name,
          latitude: s.latitude,
          longitude: s.longitude,
        })),
      });
    }

    return defs;
  }, [questPosts, storeById]);

  // ── 6. Compute progress (updates on every stamp) ──────────────────────────
  return useMemo((): Map<string, QuestProgress> => {
    const map = new Map<string, QuestProgress>();
    for (const def of questDefs) {
      const stamped = def.questStores.filter((s) =>
        stampedStoreIds.has(s.storeId),
      ).length;
      map.set(def.neighborhood, {
        ...def,
        stamped,
        total: def.questStores.length,
        isComplete: def.questStores.length > 0 && stamped >= def.questStores.length,
      });
    }
    return map;
  }, [questDefs, stampedStoreIds]);
}
