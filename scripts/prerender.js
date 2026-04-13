/**
 * Pre-render Script for Lost in Transit JP
 *
 * This script:
 * 1. Spins up a local server serving the built app
 * 2. Uses Puppeteer to visit each route and save the rendered HTML
 * 3. Fixes canonical tags in each page so Google knows the exact URL
 * 4. On Vercel, only renders high-priority pages to stay under the 45-min build limit
 *
 * Usage:
 *   node scripts/prerender.js            → full render (all routes)
 *   VERCEL=1 node scripts/prerender.js   → priority routes only (auto-set by Vercel)
 */

import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getPrerenderRoutes } from './get-prerender-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '..', 'dist');
const PORT = 4173;
const SITE_URL = 'https://lostintransitjp.com';

// ─── Vercel protection ─────────────────────────────────────────────────────
// Vercel times out builds at 45 minutes. Pre-rendering all ~1,061 store pages
// (~88 min) would fail. On Vercel we only render "priority" pages — the ones
// Google most needs full HTML for. Store pages get discovered via city page links.
const IS_VERCEL = process.env.VERCEL === '1';

const PRIORITY_PATTERNS = [
  /^\/$/,                         // homepage
  /^\/sitemap$/,                  // HTML store directory (critical for Google link discovery)
  /^\/cities$/,                   // all cities index
  /^\/neighborhoods$/,            // all neighborhoods index
  /^\/about$/,                    // about page
  /^\/blog/,                      // all blog pages
  /^\/finds/,                     // finds/field notes pages
  /^\/city\/[^/]+$/,              // city pages  e.g. /city/tokyo
  /^\/city\/[^/]+\/[^/]+$/,       // neighborhood pages e.g. /city/tokyo/shimokitazawa
  /^\/category\//,                // category pages e.g. /category/fashion
];

function isPriorityRoute(route) {
  return PRIORITY_PATTERNS.some(pattern => pattern.test(route));
}

// ─── Canonical tag fixer ───────────────────────────────────────────────────
// react-helmet-async sets canonicals dynamically via JS.
// If the old index.html had a static canonical pointing to the homepage,
// Puppeteer's HTML would contain two <link rel="canonical"> tags.
// Google ignores conflicting canonicals entirely ("User-declared canonical: None").
//
// This function ensures exactly ONE canonical exists in each pre-rendered page,
// pointing to the correct URL for that route.
function fixCanonicalTag(html, route) {
  const correctCanonical = `${SITE_URL}${route}`;
  const canonicalTagRegex = /<link[^>]*rel=["']canonical["'][^>]*\/?>/gi;
  const existingTags = html.match(canonicalTagRegex) || [];

  if (existingTags.length === 0) {
    // No canonical at all — inject one before </head>
    console.log(`  ⚠ No canonical found for ${route} — injecting: ${correctCanonical}`);
    return html.replace(
      '</head>',
      `  <link rel="canonical" href="${correctCanonical}" />\n  </head>`
    );
  }

  if (existingTags.length > 1) {
    // Multiple canonicals (static + dynamic) — strip all, inject the correct one
    console.log(`  ⚠ ${existingTags.length} canonical tags found for ${route} — deduplicating`);
    const stripped = html.replace(canonicalTagRegex, '');
    return stripped.replace(
      '</head>',
      `  <link rel="canonical" href="${correctCanonical}" />\n  </head>`
    );
  }

  // Exactly 1 canonical already — verify it's pointing to the right URL
  const tagHref = existingTags[0].match(/href=["']([^"']+)["']/)?.[1];
  if (tagHref && tagHref !== correctCanonical) {
    console.log(`  ⚠ Wrong canonical for ${route}: found "${tagHref}", replacing with "${correctCanonical}"`);
    return html.replace(canonicalTagRegex, `<link rel="canonical" href="${correctCanonical}" />`);
  }

  return html; // already perfect
}

// ─── Static file server ────────────────────────────────────────────────────
function createStaticServer(distDir, port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      // Strip query strings for file lookup
      const urlPath = req.url.split('?')[0];
      let filePath = join(distDir, urlPath === '/' ? 'index.html' : urlPath);

      // SPA fallback: if no file extension or file doesn't exist, serve index.html
      if (!filePath.includes('.') || !existsSync(filePath)) {
        filePath = join(distDir, 'index.html');
      }

      try {
        const content = readFileSync(filePath);
        const ext = filePath.split('.').pop();
        const contentTypes = {
          html: 'text/html',
          js: 'application/javascript',
          css: 'text/css',
          json: 'application/json',
          png: 'image/png',
          jpg: 'image/jpeg',
          svg: 'image/svg+xml',
          woff2: 'font/woff2',
          woff: 'font/woff',
        };
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(port, () => {
      console.log(`Static server running on http://localhost:${port}`);
      resolve(server);
    });
  });
}

// ─── Core pre-render loop ──────────────────────────────────────────────────
async function prerenderRoutes(routes) {
  console.log(`\nPre-rendering ${routes.length} routes...\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Block images/fonts during pre-render to speed things up
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const type = req.resourceType();
    if (['image', 'font', 'media'].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  let completed = 0;
  const failed = [];

  for (const route of routes) {
    try {
      const url = `http://localhost:${PORT}${route}`;

      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // Give React (and react-helmet-async) time to fully render
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get the fully-rendered HTML
      let html = await page.content();

      // Fix canonical tags — the most critical SEO step
      html = fixCanonicalTag(html, route);

      // Mark as pre-rendered (useful for debugging)
      html = html.replace('</head>', '  <!-- Pre-rendered for SEO -->\n  </head>');

      // Save to the correct path in dist/
      const outputPath = route === '/'
        ? join(DIST_DIR, 'index.html')
        : join(DIST_DIR, route, 'index.html');

      const outputDir = dirname(outputPath);
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      writeFileSync(outputPath, html);

      completed++;
      if (completed % 25 === 0 || completed === routes.length) {
        console.log(`Progress: ${completed}/${routes.length} (${Math.round(completed / routes.length * 100)}%)`);
      }
    } catch (error) {
      failed.push({ route, error: error.message });
      console.error(`✗ Failed: ${route} — ${error.message}`);
    }
  }

  await browser.close();

  console.log(`\n✅ Pre-rendering complete!`);
  console.log(`   Successful: ${completed - failed.length}`);
  if (failed.length > 0) {
    console.log(`   Failed: ${failed.length}`);
    failed.forEach(({ route, error }) => console.log(`   - ${route}: ${error}`));
  }

  return { completed, failed };
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting pre-render process...');

  if (IS_VERCEL) {
    console.log('📦 Vercel build detected — rendering priority pages only (avoids timeout)');
  } else {
    console.log('💻 Local build — rendering all routes');
  }

  console.log('');

  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Get all routes from Supabase
  const allRoutes = await getPrerenderRoutes();
  console.log(`Found ${allRoutes.length} total routes`);

  // On Vercel, only render priority pages to stay under the 45-min timeout
  const routes = IS_VERCEL
    ? allRoutes.filter(isPriorityRoute)
    : allRoutes;

  if (IS_VERCEL) {
    const skipped = allRoutes.length - routes.length;
    console.log(`Rendering ${routes.length} priority pages (skipping ${skipped} store pages)`);
    console.log('Store pages will be indexed by Google through internal links from city pages\n');
  }

  const server = await createStaticServer(DIST_DIR, PORT);

  try {
    await prerenderRoutes(routes);
  } finally {
    server.close();
  }

  console.log('\n🎉 Done! Pre-rendered site is ready in dist/');
}

main().catch(console.error);
