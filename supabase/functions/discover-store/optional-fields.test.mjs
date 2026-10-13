import assert from 'node:assert/strict';
import test from 'node:test';
import { DISCOVERED_VIA, SOURCE_TYPES, validateOptionalIntakeFields } from './optional-fields.ts';

function accepted(body) {
  const result = validateOptionalIntakeFields(body);
  assert.deepEqual(result.warnings, []);
  return result.value;
}

function dropped(field, value, reason) {
  const keepField = field === 'source_account' ? 'instagram_bio' : 'source_account';
  const result = validateOptionalIntakeFields({ [field]: value, [keepField]: 'Keep me' });
  assert.equal(result.value[field], null);
  assert.equal(result.value[keepField], 'Keep me');
  assert.deepEqual(result.warnings.map((warning) => warning.field), [field]);
  assert.match(result.warnings[0].reason, reason);
}

test('legacy requests may omit every new field without warnings', () => {
  const fields = accepted({});
  assert.deepEqual(Object.keys(fields).sort(), [
    'brands_carried', 'discovered_via', 'instagram_bio', 'opening_date',
    'price_range', 'source_account', 'source_type', 'verification_evidence', 'website',
  ]);
  assert.ok(Object.values(fields).every((value) => value === null));
});

test('accepts and trims all nine optional fields', () => {
  assert.deepEqual(accepted({
    website: ' https://example.jp/shop ',
    instagram_bio: ' Japanese vintage ',
    brands_carried: [' Kapital ', 'Comme des Garçons', 'kapital'],
    price_range: '$$',
    opening_date: '2024-02-29',
    verification_evidence: 'Official shop profile',
    source_type: 'store_website',
    source_account: '@example',
    discovered_via: 'weekly_sweep',
  }), {
    website: 'https://example.jp/shop',
    instagram_bio: 'Japanese vintage',
    brands_carried: ['Kapital', 'Comme des Garçons'],
    price_range: '$$',
    opening_date: '2024-02-29',
    verification_evidence: 'Official shop profile',
    source_type: 'store_website',
    source_account: '@example',
    discovered_via: 'weekly_sweep',
  });
});

test('null, blank text, and empty brand arrays remain optional', () => {
  const result = accepted({ website: '  ', instagram_bio: null, brands_carried: [] });
  assert.equal(result.website, null);
  assert.equal(result.instagram_bio, null);
  assert.equal(result.brands_carried, null);
});

test('invalid website is dropped, not a reason to reject the candidate', () => {
  dropped('website', 'example.jp', /http\(s\) URL/);
  dropped('website', 'javascript:alert(1)', /http\(s\) URL/);
  dropped('website', 'https://user:pass@example.jp', /no credentials/);
  dropped('website', 'http://localhost', /domain/);
  dropped('website', 'http://127.0.0.1', /domain/);
  dropped('website', 42, /string/);
  dropped('website', `https://example.jp/${'x'.repeat(2049)}`, /2048/);
  assert.equal(accepted({ website: 'http://example.jp' }).website, 'http://example.jp');
});

test('invalid text fields are dropped independently', () => {
  for (const [field, max] of [
    ['instagram_bio', 1000], ['verification_evidence', 2000], ['source_account', 200],
  ]) {
    const input = { [field]: 123, website: 'https://example.jp' };
    const result = validateOptionalIntakeFields(input);
    assert.equal(result.value[field], null);
    assert.equal(result.value.website, 'https://example.jp');
    assert.deepEqual(result.warnings.map((warning) => warning.field), [field]);
    assert.match(result.warnings[0].reason, /string/);
    dropped(field, 'x'.repeat(max + 1), new RegExp(String(max)));
    assert.equal(accepted({ [field]: 'x'.repeat(max) })[field].length, max);
  }
});

test('malformed brands drop the whole optional field', () => {
  dropped('brands_carried', 'Kapital', /array/);
  dropped('brands_carried', Array(31).fill('brand'), /30/);
  dropped('brands_carried', ['Kapital', 7], /array/);
  dropped('brands_carried', [''], /brand/);
  dropped('brands_carried', ['x'.repeat(101)], /100/);
  assert.equal(accepted({ brands_carried: Array.from({ length: 30 }, (_, i) => `brand${i}`) }).brands_carried.length, 30);
});

test('price_range keeps exactly $, $$, and $$$', () => {
  for (const price of ['$', '$$', '$$$']) assert.equal(accepted({ price_range: price }).price_range, price);
  dropped('price_range', '$$$$', /at most 3/);
  dropped('price_range', 'cheap', /at most 3/);
  dropped('price_range', '€', /\$, \$\$, or \$\$\$/);
});

test('invalid opening dates are dropped', () => {
  dropped('opening_date', '2025-02-29', /real YYYY-MM-DD/);
  dropped('opening_date', '2024-13-01', /real YYYY-MM-DD/);
  dropped('opening_date', '2024/02/29', /real YYYY-MM-DD/);
  dropped('opening_date', 20240229, /string/);
  assert.equal(accepted({ opening_date: '2024-02-29' }).opening_date, '2024-02-29');
});

test('source_type and discovered_via use the requested workflow-specific values', () => {
  assert.deepEqual(SOURCE_TYPES, [
    'instagram_post', 'threads_post', 'instagram_profile', 'store_website',
    'editorial_article', 'directory', 'open_data', 'other',
  ]);
  assert.deepEqual(DISCOVERED_VIA, [
    'weekly_sweep', 'directory_backfill', 'watchlist', 'open_data', 'manual', 'other',
  ]);
  for (const source_type of SOURCE_TYPES) assert.equal(accepted({ source_type }).source_type, source_type);
  for (const discovered_via of DISCOVERED_VIA) assert.equal(accepted({ discovered_via }).discovered_via, discovered_via);
  dropped('source_type', 'social_post', /one of/);
  dropped('discovered_via', 'web_search', /one of/);
  dropped('source_type', 5, /string/);
});

test('all bad optional fields warn independently and valid values survive', () => {
  const result = validateOptionalIntakeFields({
    website: 'not a URL',
    instagram_bio: 'A valid bio',
    brands_carried: ['Kapital', 7],
    price_range: '€',
    opening_date: '2025-02-29',
    verification_evidence: 'Official announcement',
    source_type: 'social_post',
    source_account: '@shop',
    discovered_via: 'web_search',
  });
  assert.deepEqual(result.warnings.map(({ field }) => field), [
    'website', 'brands_carried', 'price_range', 'opening_date', 'source_type', 'discovered_via',
  ]);
  assert.ok(result.warnings.every(({ reason }) => reason.length > 0));
  assert.equal(result.value.instagram_bio, 'A valid bio');
  assert.equal(result.value.verification_evidence, 'Official announcement');
  assert.equal(result.value.source_account, '@shop');
  for (const { field } of result.warnings) assert.equal(result.value[field], null);
});
