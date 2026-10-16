// The named server key is provided by Supabase as part of a JSON dictionary.
// Never fall back to the disabled legacy service_role or anon keys.
export const ACCOUNT_DELETION_SECRET_KEY_NAME = 'backend_api';

export function readAccountDeletionSecretKey(raw: string | undefined): string | null {
  if (!raw) return null;

  try {
    const keys: unknown = JSON.parse(raw);
    if (!keys || typeof keys !== 'object' || Array.isArray(keys)) return null;

    const key = (keys as Record<string, unknown>)[ACCOUNT_DELETION_SECRET_KEY_NAME];
    return typeof key === 'string' && key.startsWith('sb_secret_') ? key : null;
  } catch {
    return null;
  }
}
