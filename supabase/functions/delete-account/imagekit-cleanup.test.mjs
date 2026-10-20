import assert from 'node:assert/strict';
import test from 'node:test';
import { cleanupImageKitFindPhotos, ImageKitCleanupError } from './imagekit-cleanup.ts';

const USER = '11111111-1111-4111-8111-111111111111';
const BASE = 'https://ik.imagekit.io/wscyshoygv';
const LEGACY = `${BASE}/field-notes/old.jpg`;
const NEW = `${BASE}/stores/${USER}/new.jpg`;

function fixture(urls = [LEGACY, NEW]) {
  const calls = [];
  const assets = [
    { type: 'file', fileId: 'old-id', filePath: '/field-notes/old.jpg', url: LEGACY },
    { type: 'file', fileId: 'new-id', filePath: `/stores/${USER}/new.jpg`, url: NEW },
  ];
  const operations = {
    async listFindPhotos(user, from, to) {
      calls.push(['finds', user, from, to]);
      return { data: urls.slice(from, to + 1).map((photo_url) => ({ photo_url })), error: null };
    },
    async findSharedUrls(user, found) {
      calls.push(['references', user, found.length]);
      return [];
    },
    async listAssets(folder, skip, limit) {
      calls.push(['list', folder, skip, limit]);
      return assets.filter((asset) => asset.filePath.startsWith(`${folder}/`)).slice(skip, skip + limit);
    },
    async deleteAsset(id) { calls.push(['delete', id]); },
    reportSkipped(counts) { calls.push(['skipped', counts]); },
  };
  return { calls, operations };
}

test('deletes only exact user Find assets in legacy and new folders', async () => {
  const { calls, operations } = fixture([LEGACY, NEW, 'https://other.example/photo.jpg']);
  assert.equal(await cleanupImageKitFindPhotos(operations, USER), 2);
  assert.deepEqual(calls.filter(([kind]) => kind === 'delete'), [['delete', 'old-id'], ['delete', 'new-id']]);
  assert.ok(calls.findIndex(([kind]) => kind === 'delete') > calls.findIndex(([kind]) => kind === 'references'));
});

test('no ImageKit Finds means no ImageKit requests or deletes', async () => {
  const { calls, operations } = fixture(['https://example.com/photo.jpg']);
  assert.equal(await cleanupImageKitFindPhotos(operations, USER), 0);
  assert.equal(calls.some(([kind]) => kind === 'list' || kind === 'delete'), false);
});

test('shared Find URL is retained, logged by count, and does not block deletion', async () => {
  const { calls, operations } = fixture([LEGACY]);
  operations.findSharedUrls = async () => [LEGACY];
  assert.equal(await cleanupImageKitFindPhotos(operations, USER), 0);
  assert.equal(calls.some(([kind]) => kind === 'delete'), false);
  assert.deepEqual(calls.find(([kind]) => kind === 'skipped'), ['skipped', { shared: 1, missing: 0 }]);
});

test('a shared file is retained while an unshared file is deleted', async () => {
  const { calls, operations } = fixture([LEGACY, NEW]);
  operations.findSharedUrls = async () => [LEGACY];
  assert.equal(await cleanupImageKitFindPhotos(operations, USER), 1);
  assert.deepEqual(calls.filter(([kind]) => kind === 'delete'), [['delete', 'new-id']]);
  assert.deepEqual(calls.find(([kind]) => kind === 'skipped'), ['skipped', { shared: 1, missing: 0 }]);
});

test('missing legacy URL counts as already deleted and does not block deletion', async () => {
  const { calls, operations } = fixture([`${BASE}/field-notes/missing.jpg`]);
  assert.equal(await cleanupImageKitFindPhotos(operations, USER), 0);
  assert.equal(calls.some(([kind]) => kind === 'delete'), false);
  assert.deepEqual(calls.find(([kind]) => kind === 'skipped'), ['skipped', { shared: 0, missing: 1 }]);
});

test('a matching CDN URL with a different file path cannot be deleted', async () => {
  const { calls, operations } = fixture([LEGACY]);
  operations.listAssets = async () => [
    { type: 'file', fileId: 'wrong-id', filePath: '/field-notes/other.jpg', url: LEGACY },
  ];
  assert.equal(await cleanupImageKitFindPhotos(operations, USER), 0);
  assert.equal(calls.some(([kind]) => kind === 'delete'), false);
  assert.deepEqual(calls.find(([kind]) => kind === 'skipped'), ['skipped', { shared: 0, missing: 1 }]);
});

test('an unavailable ImageKit API or missing key still fails closed', async () => {
  const { calls, operations } = fixture([LEGACY]);
  operations.listAssets = async () => { throw new Error('ImageKit credential unavailable'); };
  await assert.rejects(cleanupImageKitFindPhotos(operations, USER), ImageKitCleanupError);
  assert.equal(calls.some(([kind]) => kind === 'delete'), false);
});

test('even if every URL is shared, ImageKit must be reachable', async () => {
  const { calls, operations } = fixture([LEGACY]);
  operations.findSharedUrls = async () => [LEGACY];
  operations.listAssets = async () => { throw new Error('ImageKit unreachable'); };
  await assert.rejects(cleanupImageKitFindPhotos(operations, USER), ImageKitCleanupError);
  assert.equal(calls.some(([kind]) => kind === 'delete'), false);
});

test('another user folder cannot be erased through a Find row', async () => {
  const { calls, operations } = fixture([`${BASE}/stores/22222222-2222-4222-8222-222222222222/other.jpg`]);
  await assert.rejects(cleanupImageKitFindPhotos(operations, USER), ImageKitCleanupError);
  assert.equal(calls.some(([kind]) => kind === 'delete'), false);
});

test('provider failure reports count but leaves Auth cleanup to the caller', async () => {
  const { operations } = fixture([LEGACY, NEW]);
  operations.deleteAsset = async (id) => { if (id === 'new-id') throw new Error('provider detail'); };
  await assert.rejects(cleanupImageKitFindPhotos(operations, USER),
    (error) => error instanceof ImageKitCleanupError && error.removedCount === 1 &&
      !error.message.includes('provider detail'));
});
