import test from 'node:test';
import assert from 'node:assert/strict';
import { enhanceWithAI } from '../../api/import-store.js';

test('single-store import prompt uses the store website, not Google editorial or review text', async () => {
  const previousKey = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = 'test-only';
  let prompt = '';
  try {
    const result = await enhanceWithAI({
      name: 'Example Shop', website: 'https://example.com',
      editorialSummary: 'LEAKED_EDITORIAL_TEXT',
      reviews: [{ text: { text: 'LEAKED_REVIEW_TEXT' } }],
      types: ['Google-derived category'],
    }, '', {
      websiteEvidence: async () => 'The official shop website sells handmade ceramics.',
      modelFetch: async (_url, options) => {
        prompt = JSON.parse(options.body).messages[0].content;
        return { ok: true, json: async () => ({ content: [{ text: '{"description":"Example Shop sells handmade ceramics.","suggestedCategories":[]}' }] }) };
      },
    });
    assert.match(prompt, /official shop website sells handmade ceramics/);
    assert.doesNotMatch(prompt, /LEAKED_EDITORIAL_TEXT|LEAKED_REVIEW_TEXT|Google-derived category/);
    assert.equal(result.needsReview, false);
  } finally {
    if (previousKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = previousKey;
  }
});

test('single-store import does not call the model when no website text is available', async () => {
  const result = await enhanceWithAI({ name: 'Example Shop', website: '' }, '', {
    websiteEvidence: async () => '',
    modelFetch: async () => { throw new Error('Model should not be called'); },
  });
  assert.equal(result.description, 'Example Shop.');
  assert.equal(result.needsReview, true);
});
