/**
 * Simple Pre-render Script for Lost in Transit JP
 *
 * This script:
 * 1. Builds the app normally
 * 2. Spins up a local server
 * 3. Uses Puppeteer to visit each route and save the rendered HTML
 *
 * Usage: node scripts/prerender.js
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

// Simple static file server
function createStaticServer(distDir, port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = join(distDir, req.url === '/' ? 'index.html' : req.url);

      // Handle SPA routing - serve index.html for routes without extensions
      if (!filePath.includes('.') || !existsSync(filePath)) {
        filePath = join(distDir, 'index.html');
      }

      try {
        const content = readFileSync(filePath);
        const ext = filePath.split('.').pop();
        const contentTypes = {
          'html': 'text/html',
          'js': 'application/javascript',
          'css': 'text/css',
          'json': 'application/json',
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'svg': 'image/svg+xml',
        };
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
        res.end(content);
      } catch (e) {
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

async function prerenderRoutes(routes) {
  console.log(`\nPre-rendering ${routes.length} routes...\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  let completed = 0;
  const failed = [];

  for (const route of routes) {
    try {
      const url = `http://localhost:${PORT}${route}`;

      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait a bit for React to fully render
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get the rendered HTML
      const html = await page.content();

      // Create directory structure
      const outputPath = route === '/'
        ? join(DIST_DIR, 'index.html')
        : join(DIST_DIR, route, 'index.html');

      const outputDir = dirname(outputPath);
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      // Add pre-rendered comment and save
      const finalHtml = html.replace('</head>', '<!-- Pre-rendered for SEO --></head>');
      writeFileSync(outputPath, finalHtml);

      completed++;
      if (completed % 50 === 0 || completed === routes.length) {
        console.log(`Progress: ${completed}/${routes.length} (${Math.round(completed/routes.length*100)}%)`);
      }
    } catch (error) {
      failed.push({ route, error: error.message });
      console.error(`Failed: ${route} - ${error.message}`);
    }
  }

  await browser.close();

  console.log(`\n✅ Pre-rendering complete!`);
  console.log(`   Successful: ${completed - failed.length}`);
  if (failed.length > 0) {
    console.log(`   Failed: ${failed.length}`);
  }

  return { completed, failed };
}

async function main() {
  console.log('🚀 Starting pre-render process...\n');

  // Check if dist exists
  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Get routes to pre-render
  const routes = await getPrerenderRoutes();
  console.log(`Found ${routes.length} routes to pre-render`);

  // Start static server
  const server = await createStaticServer(DIST_DIR, PORT);

  try {
    // Pre-render all routes
    await prerenderRoutes(routes);
  } finally {
    // Cleanup
    server.close();
  }

  console.log('\n🎉 Done! Your pre-rendered site is ready in dist/');
}

main().catch(console.error);
