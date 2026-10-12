import assert from 'node:assert/strict';
import test from 'node:test';
import { isAuthorizedCronRequest } from './auth.ts';

const request = (secret) => new Request('https://example.invalid', {
  headers: secret ? { 'x-cron-secret': secret } : {},
});

test('cron authorization fails closed when the server secret is absent', () => {
  assert.equal(isAuthorizedCronRequest(request('provided'), undefined), false);
  assert.equal(isAuthorizedCronRequest(request('provided'), ''), false);
});

test('cron authorization rejects a missing or incorrect request header', () => {
  assert.equal(isAuthorizedCronRequest(request(), 'expected'), false);
  assert.equal(isAuthorizedCronRequest(request('wrong'), 'expected'), false);
});

test('cron authorization accepts only the matching header', () => {
  assert.equal(isAuthorizedCronRequest(request('expected'), 'expected'), true);
});
