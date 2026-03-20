/**
 * generate-sitemap.mjs
 *
 * Generates public/sitemap.xml from live Supabase data.
 * Run with: node scripts/generate-sitemap.mjs
 *
 * What it does:
 * - Fetches all store slugs, cities, neighborhoods from the DB
 * - Combines with hard-coded static pages
 * - Writes public/sitemap.xml
 * - Always uses DB slugs (never generateSlug fallback) so broken
 *   entries like /store/-hiroshima can't appear
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const BASE_URL = 'https://lostintransitjp.com';
const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Static pages ────────────────────────────────────────────────────────────
const STATIC_PAGES = [
  { path: '/',              changefreq: 'daily',   priority: '1.0' },
  { path: '/map',           changefreq: 'daily',   priority: '0.9' },
  { path: '/cities',        changefreq: 'weekly',  priority: '0.8' },
  { path: '/neighborhoods', changefreq: 'weekly',  priority: '0.8' },
  { path: '/blog',          changefreq: 'weekly',  priority: '0.7' },
  { path: '/about',         changefreq: 'monthly', priority: '0.5' },
  { path: '/suggest',       changefreq: 'monthly', priority: '0.5' },
];

// ─── Category pages ───────────────────────────────────────────────────────────
const CATEGORY_PAGES = [
  'fashion', 'food', 'coffee', 'home-goods', 'museum', 'spots',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function urlEntry({ loc, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

function citySlug(city) {
  return city.toLowerCase()
    .replace(/\s*\/\s*/g, '-')
    .replace(/\s+/g, '-');
}

function neighborhoodSlug(neighborhood) {
  return neighborhood.toLowerCase().replace(/\s+/g, '-');
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function generate() {
  console.log('Fetching stores from Supabase...');

  // Fetch all stores: only need slug, city, neighborhood, updated_at
  const { data: stores, error } = await supabase
    .from('stores')
    .select('slug, city, neighborhood, updated_at')
    .not('slug', 'is', null)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error.message);
    process.exit(1);
  }

  console.log(`Fetched ${stores.length} stores`);

  // Deduplicate cities and neighborhoods from live data
  const citiesMap = new Map(); // citySlug → { name, lastmod }
  const neighborhoodsMap = new Map(); // `${citySlug}/${neighborhoodSlug}` → { city, neighborhood, lastmod }

  for (const store of stores) {
    if (!store.city) continue;
    const cs = citySlug(store.city);
    const lastmod = store.updated_at
      ? store.updated_at.split('T')[0]
      : TODAY;

    // Keep most recent lastmod per city
    if (!citiesMap.has(cs) || citiesMap.get(cs).lastmod < lastmod) {
      citiesMap.set(cs, { name: store.city, lastmod });
    }

    if (store.neighborhood) {
      const ns = neighborhoodSlug(store.neighborhood);
      const key = `${cs}/${ns}`;
      if (!neighborhoodsMap.has(key) || neighborhoodsMap.get(key).lastmod < lastmod) {
        neighborhoodsMap.set(key, { citySlug: cs, neighborhoodSlug: ns, lastmod });
      }
    }
  }

  // ── Build XML sections ──────────────────────────────────────────────────────

  // 1. Static pages
  const staticSection = [
    '  <!-- Static Pages -->',
    ...STATIC_PAGES.map(p => urlEntry({
      loc: `${BASE_URL}${p.path}`,
      lastmod: TODAY,
      changefreq: p.changefreq,
      priority: p.priority,
    })),
  ].join('\n');

  // 2. City pages (from live DB + today's date)
  const citySection = [
    '\n  <!-- City Pages -->',
    ...[...citiesMap.entries()].map(([slug, { lastmod }]) =>
      urlEntry({
        loc: `${BASE_URL}/city/${slug}`,
        lastmod,
        changefreq: 'weekly',
        priority: '0.8',
      })
    ),
  ].join('\n');

  // 3. Neighborhood pages
  const neighborhoodSection = [
    '\n  <!-- Neighborhood Pages -->',
    ...[...neighborhoodsMap.entries()].map(([, { citySlug: cs, neighborhoodSlug: ns, lastmod }]) =>
      urlEntry({
        loc: `${BASE_URL}/city/${cs}/${ns}`,
        lastmod,
        changefreq: 'weekly',
        priority: '0.7',
      })
    ),
  ].join('\n');

  // 4. Category pages
  const categorySection = [
    '\n  <!-- Category Pages -->',
    ...CATEGORY_PAGES.map(cat =>
      urlEntry({
        loc: `${BASE_URL}/category/${cat}`,
        lastmod: TODAY,
        changefreq: 'weekly',
        priority: '0.7',
      })
    ),
  ].join('\n');

  // 5. Store pages — skip any slug that's empty or starts with '-'
  const validStores = stores.filter(s => s.slug && !s.slug.startsWith('-'));
  const invalidStores = stores.filter(s => !s.slug || s.slug.startsWith('-'));

  if (invalidStores.length > 0) {
    console.warn(`⚠️  Skipped ${invalidStores.length} stores with invalid slugs:`);
    invalidStores.forEach(s => console.warn(`   - "${s.slug}" (city: ${s.city})`));
  }

  const storeSection = [
    '\n  <!-- Store Pages -->',
    ...validStores.map(store =>
      urlEntry({
        loc: `${BASE_URL}/store/${store.slug}`,
        lastmod: store.updated_at ? store.updated_at.split('T')[0] : TODAY,
        changefreq: 'monthly',
        priority: '0.6',
      })
    ),
  ].join('\n');

  // ── Assemble final XML ──────────────────────────────────────────────────────
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    staticSection,
    citySection,
    neighborhoodSection,
    categorySection,
    storeSection,
    '</urlset>',
    '', // trailing newline
  ].join('\n');

  const outPath = resolve(__dirname, '../public/sitemap.xml');
  writeFileSync(outPath, xml, 'utf8');

  console.log(`✅ sitemap.xml written to ${outPath}`);
  console.log(`   Static pages : ${STATIC_PAGES.length}`);
  console.log(`   City pages   : ${citiesMap.size}`);
  console.log(`   Neighborhoods: ${neighborhoodsMap.size}`);
  console.log(`   Categories   : ${CATEGORY_PAGES.length}`);
  console.log(`   Store pages  : ${validStores.length}`);
  console.log(`   Total URLs   : ${STATIC_PAGES.length + citiesMap.size + neighborhoodsMap.size + CATEGORY_PAGES.length + validStores.length}`);
}

generate().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
