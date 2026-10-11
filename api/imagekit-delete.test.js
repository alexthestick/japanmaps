import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { canDeleteImage, isUserOwnedFile } from './imagekit-delete.js';

const userId = 'a11b22c3-d444-4e55-8f66-778899aabbcc';

test('permits a file in the authenticated user folder', () => {
  assert.equal(isUserOwnedFile(`/stores/${userId}/photo.jpg`, userId), true);
});

test('rejects another user folder and a similar prefix', () => {
  assert.equal(isUserOwnedFile('/stores/another-user/photo.jpg', userId), false);
  assert.equal(isUserOwnedFile(`/stores/${userId}-other/photo.jpg`, userId), false);
});

test('rejects a root file and missing metadata', () => {
  assert.equal(isUserOwnedFile('/hero.jpg', userId), false);
  assert.equal(isUserOwnedFile(undefined, userId), false);
});

test('owner can delete without an admin lookup', async () => {
  const permitted = await canDeleteImage(`/stores/${userId}/photo.jpg`, userId, () => {
    throw new Error('admin lookup should not run');
  });
  assert.equal(permitted, true);
});

test('non-owner needs a server-verified admin status', async () => {
  const path = '/stores/another-user/photo.jpg';
  assert.equal(await canDeleteImage(path, userId, async () => false), false);
  assert.equal(await canDeleteImage(path, userId, async () => true), true);
  assert.equal(await canDeleteImage(path, userId, async () => undefined), false);
});

test('delete endpoint rejects anonymous requests before touching ImageKit', async () => {
  const response = {
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader() {},
  };
  await handler({ method: 'POST', headers: {}, body: { fileId: 'any-file' } }, response);
  assert.equal(response.statusCode, 401);
});
