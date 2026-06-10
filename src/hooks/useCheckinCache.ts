/**
 * useCheckinCache
 *
 * Fetches the current user's stamped store IDs once when Radar mode activates,
 * then exposes them as a Set<string> for O(1) lookups.
 *
 * Invalidation: pass `lastStampedAt` (a timestamp set by the parent whenever a
 * new stamp is recorded). The hook refetches whenever this value changes —
 * ensuring the just-stamped store's marker turns green immediately without a
 * page reload.
 *
 * Usage in HomePage.tsx:
 *   const [lastStampedAt, setLastStampedAt] = useState(0);
 *   const stampedStoreIds = useCheckinCache(isExploreMode, lastStampedAt);
 *   // In handleCheckinSuccess: setLastStampedAt(Date.now());
 */

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

export function useCheckinCache(
  isActive: boolean,
  lastStampedAt: number,
): Set<string> {
  const { user } = useAuthContext();
  const [stampedIds, setStampedIds] = useState<Set<string>>(new Set());
  const lastFetchedStampedAt = useRef<number>(-1);

  useEffect(() => {
    // Clear when Radar exits
    if (!isActive) {
      setStampedIds(new Set());
      lastFetchedStampedAt.current = -1;
      return;
    }

    // Skip if not logged in
    if (!user) return;

    // Skip if we already fetched for this lastStampedAt value
    // (avoids a double-fetch on mount)
    if (lastFetchedStampedAt.current === lastStampedAt && lastStampedAt !== 0) return;

    lastFetchedStampedAt.current = lastStampedAt;

    supabase
      .from('gps_checkins')
      .select('store_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          setStampedIds(new Set(data.map(row => row.store_id)));
        }
      });
  }, [isActive, user, lastStampedAt]);

  return stampedIds;
}
