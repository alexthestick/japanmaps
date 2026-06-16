import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Store } from '../types/store';

export interface CachedKurbItem {
  store_id:  string;
  item_id:   number;
  title:     string | null;
  brand:     string | null;
  price_usd: number | null;
  image_url: string | null;
  kurb_url:  string | null;
  size:      string | null;
  condition: string | null;
}

/**
 * Reads Kurb items from the kurb_items cache table for the given stores.
 *
 * Returns a Map<store_id, CachedKurbItem[]> (max 4 items per store).
 *
 * Only queries stores that have kurb_vendor_id set.
 * Reads are fast (indexed) and cached in React Query for 15 min —
 * the underlying table refreshes every hour via pg_cron.
 */
export function useKurbItemsByStores(stores: Store[]): Map<string, CachedKurbItem[]> {
  // Only stores with a Kurb vendor ID — stable sort so queryKey is deterministic
  const kurbStoreIds = stores
    .filter(s => s.kurb_vendor_id != null)
    .map(s => s.id)
    .sort();

  const { data } = useQuery<CachedKurbItem[]>({
    queryKey: ['kurb-cache', kurbStoreIds.join(',')],
    queryFn: async () => {
      if (kurbStoreIds.length === 0) return [];

      // kurb_items is a new table — cast to any since generated types lag behind
      const { data, error } = await (supabase as any)
        .from('kurb_items')
        .select('store_id, item_id, title, brand, price_usd, image_url, kurb_url, size, condition')
        .in('store_id', kurbStoreIds)
        .order('fetched_at', { ascending: false });

      if (error) {
        console.error('[useKurbItemsByStores] fetch error', error);
        throw error;
      }
      return (data ?? []) as unknown as CachedKurbItem[];
    },
    enabled: kurbStoreIds.length > 0,
    staleTime: 15 * 60 * 1000, // 15 min — table refreshes hourly anyway
    gcTime:    30 * 60 * 1000,
  });

  // Build map: storeId → first 4 items
  const map = new Map<string, CachedKurbItem[]>();
  if (!data) return map;

  for (const item of data) {
    const existing = map.get(item.store_id) ?? [];
    if (existing.length < 4) {
      existing.push(item);
      map.set(item.store_id, existing);
    }
  }

  return map;
}
