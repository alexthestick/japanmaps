import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GPS_CHECKIN_SECRET_KEY_NAME,
  authenticateGpsCheckin,
  readGpsCheckinSecretKey,
} from './auth.ts';

const url = 'https://example.supabase.co';
const keys = JSON.stringify({
  default: 'sb_secret_wrong_entry',
  backendrotation: 'sb_secret_selected_entry',
});

test('uses only the expected named secret key', () => {
  assert.equal(GPS_CHECKIN_SECRET_KEY_NAME, 'backendrotation');
  assert.equal(readGpsCheckinSecretKey(keys), 'sb_secret_selected_entry');
  for (const raw of [
    undefined, '', '{', 'null', '[]', '{}',
    JSON.stringify({ default: 'sb_secret_wrong_entry' }),
    JSON.stringify({ backendrotation: 42 }),
    JSON.stringify({ backendrotation: 'legacy-jwt-key' }),
  ]) {
    assert.equal(readGpsCheckinSecretKey(raw), null);
  }
});

test('missing or empty bearer token stops before making a client', async () => {
  for (const header of [null, '', 'Bearer ', 'Bearer   ', 'Basic token']) {
    const result = await authenticateGpsCheckin(header, url, keys, () => {
      throw Error('must not make a client');
    });
    assert.equal(result.kind, 'missing_auth');
  }
});

test('missing URL or expected key fails closed, without a legacy fallback', async () => {
  for (const [supabaseUrl, rawKeys] of [
    [undefined, keys],
    [url, undefined],
    [url, JSON.stringify({ default: 'sb_secret_wrong_entry' })],
    [url, JSON.stringify({ backendrotation: 'legacy-jwt-key' })],
  ]) {
    const result = await authenticateGpsCheckin('Bearer user.jwt', supabaseUrl, rawKeys, () => {
      throw Error('must not make a client');
    });
    assert.equal(result.kind, 'missing_config');
  }
});

test('verifies the caller JWT with the named-key admin client', async () => {
  const calls = [];
  const client = {
    auth: {
      getUser: async (jwt) => {
        calls.push(['getUser', jwt]);
        return { data: { user: { id: 'user-123' } }, error: null };
      },
    },
  };
  const result = await authenticateGpsCheckin('Bearer user.jwt', url, keys, (clientUrl, key) => {
    calls.push(['createClient', clientUrl, key]);
    return client;
  });
  assert.deepEqual(calls, [
    ['createClient', url, 'sb_secret_selected_entry'],
    ['getUser', 'user.jwt'],
  ]);
  assert.deepEqual(result, { kind: 'ok', userId: 'user-123', adminClient: client });
});

test('invalid or missing user never authorizes a check-in', async () => {
  for (const response of [
    { data: { user: null }, error: Error('expired') },
    { data: { user: null }, error: null },
    { data: { user: { id: '' } }, error: null },
  ]) {
    const result = await authenticateGpsCheckin('Bearer invalid.jwt', url, keys, () => ({
      auth: { getUser: async () => response },
    }));
    assert.equal(result.kind, 'invalid_session');
  }
});

test('auth service failure and client creation failure return unavailable', async () => {
  const thrown = await authenticateGpsCheckin('Bearer user.jwt', url, keys, () => {
    throw Error('network details must not leak');
  });
  assert.equal(thrown.kind, 'verification_unavailable');

  const rejected = await authenticateGpsCheckin('Bearer user.jwt', url, keys, () => ({
    auth: { getUser: async () => { throw Error('network details must not leak'); } },
  }));
  assert.equal(rejected.kind, 'verification_unavailable');
});
