import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ACCOUNT_DELETION_SECRET_KEY_NAME,
  readAccountDeletionSecretKey,
} from './secret-key.ts';

test('selects the existing named secret key, not another entry', () => {
  assert.equal(ACCOUNT_DELETION_SECRET_KEY_NAME, 'backend_api');
  assert.equal(readAccountDeletionSecretKey(JSON.stringify({
    default: 'sb_secret_other',
    backend_api: 'sb_secret_example',
  })), 'sb_secret_example');
});

test('fails closed when the dictionary or named key is absent or malformed', () => {
  for (const raw of [undefined, '', '{', 'null', '[]', '{}',
    JSON.stringify({ backend_api: 123 }),
    JSON.stringify({ backend_api: 'legacy-jwt-key' }),
  ]) {
    assert.equal(readAccountDeletionSecretKey(raw), null);
  }
});
