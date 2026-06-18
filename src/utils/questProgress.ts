/**
 * questProgress.ts
 *
 * Pure utility for computing quest progress from a list of quest stores
 * and the user's stamped store ID set. Extracted so components can call it
 * without depending on the full useNeighborhoodQuests hook.
 *
 * Usage:
 *   const { stamped, total, isComplete } = getQuestProgress(
 *     quest.questStores,
 *     stampedStoreIds,
 *   );
 */

import type { QuestStore } from '../hooks/useNeighborhoodQuests';

export interface QuestProgressResult {
  /** Number of quest stores the user has stamped */
  stamped: number;
  /** Total number of quest stores */
  total: number;
  /** True when stamped >= total and total > 0 */
  isComplete: boolean;
}

/**
 * Compute how far a user has progressed through a quest's store list.
 *
 * @param questStores  - Ordered list of stores that belong to this quest
 * @param stampedStoreIds - Set of all store IDs the user has ever stamped
 */
export function getQuestProgress(
  questStores: QuestStore[],
  stampedStoreIds: Set<string>,
): QuestProgressResult {
  const total = questStores.length;
  const stamped = questStores.filter((s) => stampedStoreIds.has(s.storeId)).length;
  return {
    stamped,
    total,
    isComplete: total > 0 && stamped >= total,
  };
}
