export const ACCOUNT_STORAGE_BUCKETS = [
  'field-notes',
  'profile-photos',
  'stamp-photos',
  'finds-photos',
] as const;

const BATCH_SIZE = 100;
const MAX_BATCHES_PER_BUCKET = 1000;

type OwnedObject = { object_name: string };

export type AccountDeletionOperations = {
  cleanupImageKit: (userId: string) => Promise<number>;
  listOwned: (userId: string, bucket: string) => Promise<{ data: OwnedObject[] | null; error: unknown }>;
  remove: (bucket: string, paths: string[]) => Promise<{ data: unknown[] | null; error: unknown }>;
  deleteUser: (userId: string) => Promise<{ error: unknown }>;
};

export class AccountDeletionError extends Error {
  readonly stage: 'cleanup' | 'auth';
  readonly removedCount: number;
  readonly imagekitRemovedCount: number;

  constructor(stage: 'cleanup' | 'auth', removedCount: number, imagekitRemovedCount = 0) {
    super(stage === 'cleanup' ? 'Account file cleanup failed' : 'Auth deletion failed');
    this.stage = stage;
    this.removedCount = removedCount;
    this.imagekitRemovedCount = imagekitRemovedCount;
  }
}

/** Only the matching Auth user may reach this function; the SQL lookup is read-only. */
export async function cleanupStorageAndDeleteUser(
  operations: AccountDeletionOperations,
  userId: string,
): Promise<{ removedCount: number; imagekitRemovedCount: number }> {
  let removedCount = 0;
  let imagekitRemovedCount = 0;

  // ImageKit is checked first so a missing API key or an unresolved legacy
  // photo cannot cause any Supabase Storage removal.
  try {
    imagekitRemovedCount = await operations.cleanupImageKit(userId);
  } catch (error) {
    const confirmed = error && typeof error === 'object' && 'removedCount' in error &&
      typeof error.removedCount === 'number' ? error.removedCount : 0;
    throw new AccountDeletionError('cleanup', 0, confirmed);
  }

  for (const bucket of ACCOUNT_STORAGE_BUCKETS) {
    for (let batch = 0; batch < MAX_BATCHES_PER_BUCKET; batch++) {
      let result;
      try {
        result = await operations.listOwned(userId, bucket);
      } catch {
        throw new AccountDeletionError('cleanup', removedCount, imagekitRemovedCount);
      }
      const { data, error } = result;

      if (error || !Array.isArray(data) || data.length > BATCH_SIZE ||
        data.some((object) => !object || typeof object.object_name !== 'string' || !object.object_name)) {
        throw new AccountDeletionError('cleanup', removedCount, imagekitRemovedCount);
      }
      if (data.length === 0) break;

      const paths = data.map((object) => object.object_name);
      let removal;
      try {
        removal = await operations.remove(bucket, paths);
      } catch {
        throw new AccountDeletionError('cleanup', removedCount, imagekitRemovedCount);
      }
      const { data: removed, error: removeError } = removal;
      if (removeError || !Array.isArray(removed) || removed.length !== paths.length) {
        throw new AccountDeletionError('cleanup', removedCount, imagekitRemovedCount);
      }
      removedCount += removed.length;

      if (batch === MAX_BATCHES_PER_BUCKET - 1) {
        throw new AccountDeletionError('cleanup', removedCount, imagekitRemovedCount);
      }
    }
  }

  let deletion;
  try {
    deletion = await operations.deleteUser(userId);
  } catch {
    throw new AccountDeletionError('auth', removedCount, imagekitRemovedCount);
  }
  const { error: deleteError } = deletion;
  if (deleteError) throw new AccountDeletionError('auth', removedCount, imagekitRemovedCount);
  return { removedCount, imagekitRemovedCount };
}
