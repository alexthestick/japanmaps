import test from 'node:test';
import assert from 'node:assert/strict';
import { getDisplayUsername } from '../src/utils/slugify.ts';

test('uses a real username, then a display name', () => {
  assert.equal(getDisplayUsername({ username: 'alex', display_name: 'Alex' }, '12345678'), 'alex');
  assert.equal(getDisplayUsername({ username: null, display_name: 'Alex' }, '12345678'), 'Alex');
});

test('uses the same email-free fallback for an empty profile', () => {
  const id = '12345678-1234-1234-1234-123456789abc';
  assert.equal(getDisplayUsername({ username: null, display_name: null }, id), 'user_1234');
  assert.equal(getDisplayUsername(null, id), 'user_1234');
  assert.equal(getDisplayUsername(null), 'traveler');
});
