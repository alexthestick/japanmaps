import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DISCOVERED_VIA,
  SOURCE_TYPES,
  validateOptionalIntakeFields,
} from './optional-fields.ts';

function valid(body) {
  const result = validateOptionalIntakeFields(body);
  assert.equal(result.ok, true, result.error);
  return result.value;
}

function invalid(body, message) {
  const result = validateOptionalIntakeFields(body);
  assert.equal(result.ok, false);
  assert.match(result.error, message);
}

test('legacy Muse requests may omit every new field', () => {
  const fields = valid({});
  assert.deepEqual(Object.keys(fields).sort(), [
    'brands_carried', 'discovered_via', 'instagram_bio', 'opening_date',
    'price_range', 'source_account', 'source_type', 'verification_evidence', 'website',
  ]);
  assert.ok(Object.values(fields).every((value) => value === null));
});

test('accepts and trims all nine optional fields', () => {
  assert.deepEqual(valid({
    website: ' https://example.jp/shop ',
    instagram_bio: ' Japanese vintage ',
    brands_carried: [' Kapital ', 'Comme des Garçons', 'kapital'],
    price_range: '$$',
    opening_date: '2024-02-29',
    verification_evidence: 'Official shop profile',
    source_type: 'store_website',
    source_account: '@example',
    discovered_via: 'web_search',
  }), {
    website: 'https://example.jp/shop',
    instagram_bio: 'Japanese vintage',
    brands_carried: ['Kapital', 'Comme des Garçons'],
    price_range: '$$',
    opening_date: '2024-02-29',
    verification_evidence: 'Official shop profile',
    source_type: 'store_website',
    source_account: '@example',
    discovered_via: 'web_search',
  });
});

test('null, blank text, and empty brand arrays remain optional', () => {
  const result = valid({ website: '  ', instagram_bio: null, brands_carried: [] });
  assert.equal(result.website, null);
  assert.equal(result.instagram_bio, null);
  assert.equal(result.brands_carried, null);
});

test('website requires a complete http(s) URL without credentials', () => {
  invalid({ website: 'example.jp' }, /website/);
  invalid({ website: 'javascript:alert(1)' }, /website/);
  invalid({ website: 'https://user:pass@example.jp' }, /website/);
  invalid({ website: 'http://localhost' }, /website/);
  invalid({ website: 'http://127.0.0.1' }, /website/);
  invalid({ website: 42 }, /website/);
  invalid({ website: `https://example.jp/${'x'.repeat(2049)}` }, /website/);
  assert.equal(valid({ website: 'http://example.jp' }).website, 'http://example.jp');
});

test('text fields reject non-strings and overlong values', () => {
  for (const [field, max] of [
    ['instagram_bio', 1000],
    ['verification_evidence', 2000],
    ['source_account', 200],
  ]) {
    invalid({ [field]: 123 }, new RegExp(field));
    invalid({ [field]: 'x'.repeat(max + 1) }, new RegExp(field));
    assert.equal(valid({ [field]: 'x'.repeat(max) })[field].length, max);
  }
});

test('brands must be a bounded array of nonempty short strings', () => {
  invalid({ brands_carried: 'Kapital' }, /brands_carried/);
  invalid({ brands_carried: Array(31).fill('brand') }, /30/);
  invalid({ brands_carried: ['Kapital', 7] }, /brands_carried/);
  invalid({ brands_carried: [''] }, /brand/);
  invalid({ brands_carried: ['x'.repeat(101)] }, /100/);
  assert.equal(valid({ brands_carried: Array.from({ length: 30 }, (_, i) => `brand${i}`) }).brands_carried.length, 30);
});

test('price range uses the same three values as store listings', () => {
  for (const price of ['$', '$$', '$$$']) assert.equal(valid({ price_range: price }).price_range, price);
  invalid({ price_range: '$$$$' }, /price_range/);
  invalid({ price_range: 'cheap' }, /price_range/);
});

test('opening date must be a real ISO calendar date', () => {
  invalid({ opening_date: '2025-02-29' }, /opening_date/);
  invalid({ opening_date: '2024-13-01' }, /opening_date/);
  invalid({ opening_date: '2024/02/29' }, /opening_date/);
  invalid({ opening_date: 20240229 }, /opening_date/);
  assert.equal(valid({ opening_date: '2024-02-29' }).opening_date, '2024-02-29');
});

test('source_type and discovered_via accept only documented values', () => {
  for (const source_type of SOURCE_TYPES) assert.equal(valid({ source_type }).source_type, source_type);
  for (const discovered_via of DISCOVERED_VIA) assert.equal(valid({ discovered_via }).discovered_via, discovered_via);
  invalid({ source_type: 'arbitrary' }, /source_type/);
  invalid({ discovered_via: 'arbitrary' }, /discovered_via/);
  invalid({ source_type: 5 }, /source_type/);
});
