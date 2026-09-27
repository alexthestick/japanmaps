import { supabase } from '../lib/supabase';

/**
 * Cheap count-only query (head: true — no rows transferred) for the
 * nav-level pending-suggestions badge in Header.tsx. Mirrors the
 * `discovery_bot` daily-rate-limit count query in discover-store's Edge
 * Function, just without the date/source filters — every pending
 * suggestion (public_form or discovery_bot) counts, since Alex reviews
 * both from the same queue.
 */
export async function getPendingSuggestionCount(): Promise<number> {
  const { count, error } = await supabase
    .from('store_suggestions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching pending suggestion count:', error);
    return 0;
  }
  return count ?? 0;
}
