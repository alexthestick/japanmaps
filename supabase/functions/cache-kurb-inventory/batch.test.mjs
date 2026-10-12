import assert from 'node:assert/strict';
import test from 'node:test';
import { cursorAfterAttempt, selectBatch } from './batch.ts';

const stores = Array.from({ length: 75 }, (_, index) => ({
  id: `00000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
  kurb_vendor_id: index + 1,
}));

test('four 15-minute batches cover 75 stores exactly once', () => {
  let cursor = null;
  const visited = [];
  for (let run = 0; run < 4; run++) {
    const batch = selectBatch(stores, cursor, 19);
    visited.push(...batch.map((store) => store.id));
    cursor = cursorAfterAttempt(stores, batch, batch.length, cursor);
  }
  assert.equal(visited.length, 75);
  assert.equal(new Set(visited).size, 75);
  assert.equal(cursor, null);
  assert.equal(selectBatch(stores, cursor, 19)[0].id, stores[0].id);
});

test('a shortened run resumes after its last attempted store', () => {
  const batch = selectBatch(stores, null, 19);
  const cursor = cursorAfterAttempt(stores, batch, 7, null);
  assert.equal(cursor, stores[6].id);
  assert.equal(selectBatch(stores, cursor, 19)[0].id, stores[7].id);
});

test('a removed cursor store still advances in ID order', () => {
  const withoutTen = stores.filter((store) => store.id !== stores[9].id);
  assert.equal(selectBatch(withoutTen, stores[9].id, 19)[0].id, stores[10].id);
});

test('cursor beyond all stores wraps to the beginning', () => {
  assert.equal(selectBatch(stores, 'ffffffff-ffff-ffff-ffff-ffffffffffff', 19)[0].id, stores[0].id);
});
