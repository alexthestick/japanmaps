/**
 * useNeighborhoodQuests
 *
 * Loads all neighborhood guide articles (blog_posts) and computes the
 * user's all-time quest progress for each neighborhood.
 *
 * Data flow:
 *   1. Fetch blog_posts with sections_data (lightweight — 14 rows)
 *   2. Fetch all store stubs (id, name, neighborhood) for name matching
 *   3. For each article, extract store_name values from sections_data and
 *      match them to store IDs by exact case-insensitive name lookup
 *   4. Derive the quest's neighborhood from the most-common `store.neighborhood`
 *      among matched stores (avoids relying on article title parsing)
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

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract store_name values from sections_data JSON array */
function extractStoreNames(sectionsData: unknown): string[] {
  if (!Array.isArray(sectionsData)) return [];
  return sectionsData
    .map((s: { store_name?: string }) => (s.store_name ?? '').trim())
    .filter((n) => n.length > 0);
}

/** Return the most-common non-null value from an array */
function mostCommon(values: (string | null | undefined)[]): string | null {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

// ── Internal store stub (lightweight — only what we need for matching) ────────

interface StoreStub {
  id: string;
  name: string;
  neighborhood: string | null;
}

// ── Quest definition (stable — only changes if blog posts or stores change) ───

interface QuestDef {
  questId: string;
  questTitle: string;
  questSlug: string;
  neighborhood: string;
  questStores: QuestStore[];
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useNeighborhoodQuests(
  stampedStoreIds: Set<string>,
): Map<string, QuestProgress> {
  // ── 1. Fetch blog posts (sections_data only) ────────────────────────────
  const { data: blogPosts } = useQuery({
    queryKey: ['neighborhood-quests-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, sections_data')
        .not('sections_data', 'is', null);
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        title: string;
        slug: string;
        sections_data: unknown;
      }[];
    },
    staleTime: 30 * 60 * 1000, // 30 min — articles rarely change
  });

  // ── 2. Fetch lightweight store stubs for name matching ──────────────────
  const { data: storeStubs } = useQuery({
    queryKey: ['store-stubs-for-quests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, neighborhood');
      if (error) throw error;
      return (data ?? []) as StoreStub[];
    },
    staleTime: 10 * 60 * 1000, // 10 min
  });

  // ── 3. Build name → stub lookup ─────────────────────────────────────────
  const storeNameMap = useMemo((): Map<string, StoreStub> => {
    if (!storeStubs) return new Map();
    const map = new Map<string, StoreStub>();
    for (const stub of storeStubs) {
      const key = stub.name.toLowerCase().trim();
      // If duplicate name, prefer the one with a neighborhood (more specific)
      if (!map.has(key) || (!map.get(key)!.neighborhood && stub.neighborhood)) {
        map.set(key, stub);
      }
    }
    return map;
  }, [storeStubs]);

  // ── 4. Derive quest definitions (stable — not dependent on stamps) ───────
  const questDefs = useMemo((): QuestDef[] => {
    if (!blogPosts || storeNameMap.size === 0) return [];

    const seen = new Set<string>(); // one quest per neighborhood
    const defs: QuestDef[] = [];

    for (const post of blogPosts) {
      const storeNames = extractStoreNames(post.sections_data);
      if (storeNames.length === 0) continue;

      // Match store names to stubs
      const matchedStubs: (StoreStub & { originalName: string })[] = [];
      for (const name of storeNames) {
        const stub = storeNameMap.get(name.toLowerCase().trim());
        if (stub) matchedStubs.push({ ...stub, originalName: name });
      }
      if (matchedStubs.length === 0) continue;

      // Derive neighborhood from most-common neighborhood among matched stores
      const neighborhood = mostCommon(matchedStubs.map((s) => s.neighborhood));
      if (!neighborhood) continue;

      // One quest per neighborhood (first article wins)
      if (seen.has(neighborhood)) continue;
      seen.add(neighborhood);

      defs.push({
        questId: post.id,
        questTitle: post.title.trim(),
        questSlug: post.slug,
        neighborhood,
        questStores: matchedStubs.map((s) => ({
          storeId: s.id,
          storeName: s.name,
        })),
      });
    }

    return defs;
  }, [blogPosts, storeNameMap]);

  // ── 5. Compute progress (updates on every stamp) ─────────────────────────
  return useMemo((): Map<string, QuestProgress> => {
    const map = new Map<string, QuestProgress>();
    for (const def of questDefs) {
      const stamped = def.questStores.filter((s) =>
        stampedStoreIds.has(s.storeId)
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
