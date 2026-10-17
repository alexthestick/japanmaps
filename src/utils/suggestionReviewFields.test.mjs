import assert from 'node:assert/strict';
import test from 'node:test';
import { isEstimatedPrice, isRecentlyOpened, safeWebsiteUrl } from './suggestionReviewFields.ts';

const NOW = new Date('2026-10-16T03:00:00Z'); // October 16 in Japan

test('New means opened within the last 90 Japan-local days', () => {
  assert.equal(isRecentlyOpened('2026-10-16', NOW), true);
  assert.equal(isRecentlyOpened('2026-07-18', NOW), true);
  assert.equal(isRecentlyOpened('2026-07-17', NOW), false);
  assert.equal(isRecentlyOpened('2026-10-17', NOW), false);
  assert.equal(isRecentlyOpened(undefined, NOW), false);
  assert.equal(isRecentlyOpened('not-a-date', NOW), false);
});

test('estimated price is shown only when evidence says inferred', () => {
  assert.equal(isEstimatedPrice('Price inferred from Instagram'), true);
  assert.equal(isEstimatedPrice('IG post checked'), false);
  assert.equal(isEstimatedPrice(undefined), false);
});

test('website links reject non-web schemes and malformed values', () => {
  assert.equal(safeWebsiteUrl('https://example.com/shop')?.href, 'https://example.com/shop');
  assert.equal(safeWebsiteUrl('javascript:alert(1)'), null);
  assert.equal(safeWebsiteUrl('mailto:hello@example.com'), null);
  assert.equal(safeWebsiteUrl('not a url'), null);
});
