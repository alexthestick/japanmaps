import assert from 'node:assert/strict';
import test from 'node:test';
import { ACCOUNT_STORAGE_BUCKETS, AccountDeletionError, cleanupStorageAndDeleteUser } from './storage-cleanup.ts';

const USER_ID = '11111111-1111-4111-8111-111111111111';

function fixture(filesByBucket = {}) {
  const files = new Map(ACCOUNT_STORAGE_BUCKETS.map((bucket) => [bucket, [...(filesByBucket[bucket] ?? [])]]));
  const calls = [];
  const operations = {
    async listOwned(userId, bucket) {
      calls.push(['list', userId, bucket]);
      return { data: files.get(bucket).slice(0, 100).map((object_name) => ({ object_name })), error: null };
    },
    async remove(bucket, paths) {
      calls.push(['remove', bucket, [...paths]]);
      files.set(bucket, files.get(bucket).filter((path) => !paths.includes(path)));
      return { data: paths.map((name) => ({ name })), error: null };
    },
    async deleteUser(userId) {
      calls.push(['deleteUser', userId]);
      return { error: null };
    },
  };
  return { files, calls, operations };
}

test('removes all owned objects in each bucket before deleting the calling user', async () => {
  const { files, calls, operations } = fixture({
    'field-notes': ['field-notes/user/a.jpg'],
    'profile-photos': ['user.jpg'],
    'stamp-photos': ['user/checkin.jpg'],
    'finds-photos': ['user/find.jpg'],
  });
  const result = await cleanupStorageAndDeleteUser(operations, USER_ID);
  assert.deepEqual(result, { removedCount: 4 });
  assert.ok([...files.values()].every((paths) => paths.length === 0));
  assert.deepEqual(calls.at(-1), ['deleteUser', USER_ID]);
  assert.equal(calls.filter(([method]) => method === 'remove').length, 4);
});

test('paginates by repeatedly reading the first batch after each successful remove', async () => {
  const names = Array.from({ length: 235 }, (_, i) => `user/file-${i}.jpg`);
  const { files, calls, operations } = fixture({ 'finds-photos': names });
  const result = await cleanupStorageAndDeleteUser(operations, USER_ID);
  assert.equal(result.removedCount, 235);
  assert.equal(files.get('finds-photos').length, 0);
  assert.deepEqual(calls.filter(([method]) => method === 'remove').map(([, , paths]) => paths.length), [100, 100, 35]);
});

test('a listing error fails closed and never calls Auth deletion', async () => {
  const { calls, operations } = fixture();
  operations.listOwned = async () => ({ data: null, error: new Error('private path') });
  await assert.rejects(cleanupStorageAndDeleteUser(operations, USER_ID),
    (error) => error instanceof AccountDeletionError && error.stage === 'cleanup' && error.removedCount === 0);
  assert.equal(calls.some(([method]) => method === 'deleteUser'), false);
});

test('an incomplete Storage remove fails closed even if the API returns no error', async () => {
  const { calls, operations } = fixture({ 'field-notes': ['a.jpg', 'b.jpg'] });
  operations.remove = async () => ({ data: [{ name: 'a.jpg' }], error: null });
  await assert.rejects(cleanupStorageAndDeleteUser(operations, USER_ID),
    (error) => error instanceof AccountDeletionError && error.stage === 'cleanup');
  assert.equal(calls.some(([method]) => method === 'deleteUser'), false);
});

test('a Storage exception after an earlier batch leaves Auth intact and reports confirmed count', async () => {
  const { calls, operations } = fixture({ 'field-notes': ['a.jpg'], 'profile-photos': ['b.jpg'] });
  const originalRemove = operations.remove;
  operations.remove = (bucket, paths) => bucket === 'profile-photos'
    ? Promise.reject(new Error('do not log this path'))
    : originalRemove(bucket, paths);
  await assert.rejects(cleanupStorageAndDeleteUser(operations, USER_ID),
    (error) => error instanceof AccountDeletionError && error.stage === 'cleanup' && error.removedCount === 1);
  assert.equal(calls.some(([method]) => method === 'deleteUser'), false);
});

test('an Auth deletion failure is distinct from a Storage failure', async () => {
  const { operations } = fixture();
  operations.deleteUser = async () => ({ error: new Error('failure') });
  await assert.rejects(cleanupStorageAndDeleteUser(operations, USER_ID),
    (error) => error instanceof AccountDeletionError && error.stage === 'auth');
});
