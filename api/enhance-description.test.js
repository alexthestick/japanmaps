import test from 'node:test';
import assert from 'node:assert/strict';
import { handleEnhance } from './enhance-description.js';

function mockResponse() {
  return {
    statusCode: 200,
    setHeader() {},
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
}

test('website evidence reaches the model; legacy Google text does not', async () => {
  const previousKey = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = 'test-only';
  let prompt = '';
  try {
    const response = mockResponse();
    await handleEnhance({ method: 'POST', headers: {}, body: {
      name: 'Example Shop', category: 'Fashion', website: 'https://example.com',
      city: 'Tokyo', reviews: [{ text: { text: 'LEAKED_REVIEW_TEXT' } }],
      editorialSummary: 'LEAKED_EDITORIAL_TEXT',
    } }, response, {
      websiteEvidence: async () => 'Own website says it sells vintage clothes.',
      modelFetch: async (_url, options) => {
        prompt = JSON.parse(options.body).messages[0].content;
        return { ok: true, json: async () => ({ content: [{ text: '{"description":"Example Shop sells vintage clothes.","suggestedSubCategories":["vintage"]}' }] }) };
      },
    });
    assert.equal(response.statusCode, 200);
    assert.match(prompt, /Own website says it sells vintage clothes/);
    assert.doesNotMatch(prompt, /LEAKED_REVIEW_TEXT|LEAKED_EDITORIAL_TEXT/);
    assert.equal(response.body.needsReview, false);
  } finally {
    if (previousKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = previousKey;
  }
});

test('without website evidence the endpoint returns a neutral review-required draft', async () => {
  const previousKey = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = 'test-only';
  try {
    const response = mockResponse();
    await handleEnhance({ method: 'POST', headers: {}, body: { name: 'Example Shop', city: 'Tokyo' } }, response, {
      websiteEvidence: async () => '',
      modelFetch: async () => { throw new Error('Model should not be called'); },
    });
    assert.equal(response.body.description, 'Example Shop in Tokyo.');
    assert.equal(response.body.needsReview, true);
  } finally {
    if (previousKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = previousKey;
  }
});
