// scripts/generate-store-descriptions.mjs
//
// One-time script: generates AI descriptions for stores with thin content.
//
// Usage:
//   DRY_RUN=true node scripts/generate-store-descriptions.mjs   ← preview, no DB writes
//   node scripts/generate-store-descriptions.mjs                 ← live, writes to DB
//
// Prerequisites:
//   npm install @anthropic-ai/sdk
//   Add ANTHROPIC_API_KEY and SUPABASE_SERVICE_ROLE_KEY to your .env file
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();                          // loads .env
config({ path: '.env.local', override: false }); // loads .env.local (Vite convention)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DRY_RUN = process.env.DRY_RUN === 'true';
const BATCH_SIZE = 5;
const DELAY_MS  = 800;

function isThinDescription(store) {
  if (!store.description || store.description.length < 150) return true;
  if (store.description.includes('— Fashion boutique / clothing store located in')) return true;
  if (/is located at .+Japan/.test(store.description)) return true;
  return false;
}

async function generateDescription(store) {
  const tags = Array.isArray(store.categories)
    ? store.categories.join(', ')
    : (store.categories || '');

  const location = store.neighborhood
    ? `${store.neighborhood}, ${store.city}`
    : store.city;

  const prompt = `Write a 2-3 sentence store description for "Lost in Transit", a curated discovery app for vintage, archive, and streetwear stores across Japan. The audience is fashion-aware travellers and collectors.

Store details:
- Name: ${store.name}
- Location: ${location}, Japan
- Type: ${store.main_category || 'Fashion'}
- Style tags: ${tags || 'fashion, clothing'}

Writing rules:
- Third person, present tense
- Tone: understated and knowledgeable, like a recommendation from a friend who knows fashion
- Do NOT invent specific brand names you are not certain about
- Do NOT use "hidden gem", "must-visit", "treasure trove", or tourist-brochure language
- Do NOT repeat phrases like "carefully edited", "carefully considered", "rewards patient browsing", or "serious fashion travellers" — vary your vocabulary across descriptions
- Use correct English grammar — "a thoughtful" not "an thoughtful", "a sharp" not "an sharp"
- 180-260 characters total
- The final sentence should give a fashion-conscious traveller a reason to visit

Output the description only — no quotes, no labels, no extra commentary.`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 350,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text.trim();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log(`\n=== Generate Store Descriptions ===`);
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN — no DB writes' : '✏️  LIVE — will update DB'}\n`);

  const { data: stores, error } = await supabase
    .from('stores')
    .select('id, name, city, neighborhood, main_category, categories, description')
    .order('name');

  if (error) {
    console.error('Failed to fetch stores:', error.message);
    process.exit(1);
  }

  const thinStores = stores.filter(isThinDescription);
  console.log(`${thinStores.length} stores need new descriptions (out of ${stores.length} total)\n`);

  let processed = 0;
  let failed    = 0;

  for (let i = 0; i < thinStores.length; i += BATCH_SIZE) {
    const batch = thinStores.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (store) => {
      try {
        const description = await generateDescription(store);
        processed++;

        console.log(`[${processed}/${thinStores.length}] ${store.name} — ${store.city}`);
        console.log(`  BEFORE: ${store.description || '(empty)'}`);
        console.log(`  AFTER:  ${description}`);

        if (!DRY_RUN) {
          const { error: updateError } = await supabase
            .from('stores')
            .update({ description })
            .eq('id', store.id);

          if (updateError) {
            console.error(`  ❌ DB error: ${updateError.message}`);
            failed++;
          } else {
            console.log(`  ✅ Saved`);
          }
        }
      } catch (err) {
        console.error(`  ❌ Failed for ${store.name}: ${err.message}`);
        failed++;
      }
    }));

    if (i + BATCH_SIZE < thinStores.length) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n=== Complete ===`);
  console.log(`Processed: ${processed} | Errors: ${failed}`);
  if (DRY_RUN) console.log(`(Dry run — nothing was written to the DB)`);
}

main().catch(console.error);
