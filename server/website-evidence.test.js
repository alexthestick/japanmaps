import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchWebsiteEvidence, robotsAllows, safeWebsiteUrl } from './website-evidence.js';

test('uses plain text from a store website and excludes page scripts', async () => {
  const requests = [];
  const request = async url => {
    requests.push(url.pathname);
    if (url.pathname === '/robots.txt') return { status: 200, text: 'User-agent: *\nAllow: /' };
    return { status: 200, contentType: 'text/html; charset=utf-8', text: '<h1>Vintage clothing</h1><script>ignore me</script><p>Tokyo shop &amp; studio.</p>' };
  };
  assert.equal(await fetchWebsiteEvidence('https://example.com/', request), 'Vintage clothing Tokyo shop & studio.');
  assert.deepEqual(requests, ['/robots.txt', '/']);
});

test('respects robots.txt before reading the page', async () => {
  const requests = [];
  const text = await fetchWebsiteEvidence('https://example.com/private', async url => {
    requests.push(url.pathname);
    return { status: 200, text: 'User-agent: *\nDisallow: /private' };
  });
  assert.equal(text, '');
  assert.deepEqual(requests, ['/robots.txt']);
  assert.equal(robotsAllows('User-agent: *\nDisallow: /private', '/private'), false);
});

test('rejects local and non-HTTPS website URLs', () => {
  for (const url of ['http://example.com', 'https://localhost', 'https://127.0.0.1', 'https://example.com:8443', 'https://user:pass@example.com']) {
    assert.equal(safeWebsiteUrl(url), null);
  }
});
