// Supabase provides named server keys as a JSON dictionary. Never fall back to
// the legacy anon or service_role keys when the expected key is unavailable.
export const GPS_CHECKIN_SECRET_KEY_NAME = 'backendrotation';

export function readGpsCheckinSecretKey(raw: string | undefined): string | null {
  if (!raw) return null;

  try {
    const keys: unknown = JSON.parse(raw);
    if (!keys || typeof keys !== 'object' || Array.isArray(keys)) return null;

    const key = (keys as Record<string, unknown>)[GPS_CHECKIN_SECRET_KEY_NAME];
    return typeof key === 'string' && key.startsWith('sb_secret_') ? key : null;
  } catch {
    return null;
  }
}

type AuthClient = {
  auth: {
    getUser: (jwt: string) => Promise<{
      data: { user: { id: string } | null };
      error: unknown;
    }>;
  };
};

export type GpsCheckinAuthResult<Client extends AuthClient> =
  | { kind: 'ok'; userId: string; adminClient: Client }
  | { kind: 'missing_auth' | 'missing_config' | 'verification_unavailable' | 'invalid_session' };

export async function authenticateGpsCheckin<Client extends AuthClient>(
  authHeader: string | null,
  supabaseUrl: string | undefined,
  rawSecretKeys: string | undefined,
  createAdminClient: (url: string, key: string) => Client,
): Promise<GpsCheckinAuthResult<Client>> {
  if (!authHeader?.startsWith('Bearer ') || !authHeader.slice('Bearer '.length).trim()) {
    return { kind: 'missing_auth' };
  }

  const secretKey = readGpsCheckinSecretKey(rawSecretKeys);
  if (!supabaseUrl || !secretKey) return { kind: 'missing_config' };

  try {
    const adminClient = createAdminClient(supabaseUrl, secretKey);
    const jwt = authHeader.slice('Bearer '.length);
    const { data: { user }, error } = await adminClient.auth.getUser(jwt);
    if (error || !user?.id) return { kind: 'invalid_session' };
    return { kind: 'ok', userId: user.id, adminClient };
  } catch {
    return { kind: 'verification_unavailable' };
  }
}
