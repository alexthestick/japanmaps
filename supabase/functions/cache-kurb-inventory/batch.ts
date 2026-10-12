export interface KurbStore {
  id: string;
  kurb_vendor_id: number;
}

// UUID strings have a fixed layout, so lexical order is stable across runs.
export function selectBatch(
  stores: readonly KurbStore[],
  lastStoreId: string | null,
  batchSize: number,
): KurbStore[] {
  const ordered = [...stores].sort((a, b) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0
  );
  const firstAfterCursor = lastStoreId === null
    ? 0
    : ordered.findIndex((store) => store.id > lastStoreId);
  const start = firstAfterCursor === -1 ? 0 : firstAfterCursor;
  return ordered.slice(start, start + batchSize);
}

export function cursorAfterAttempt(
  stores: readonly KurbStore[],
  selected: readonly KurbStore[],
  attempted: number,
  previousCursor: string | null,
): string | null {
  if (attempted === 0) return previousCursor;
  const lastAttemptedId = selected[attempted - 1]?.id;
  if (!lastAttemptedId) return previousCursor;
  const lastStoreId = stores.reduce<string | null>(
    (maximum, store) => maximum === null || store.id > maximum ? store.id : maximum,
    null,
  );
  return lastAttemptedId === lastStoreId ? null : lastAttemptedId;
}
