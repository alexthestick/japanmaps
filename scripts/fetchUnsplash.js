#!/usr/bin/env node

/**
 * Unsplash Fallback Image Fetcher
 * 
 * Fetches high-quality images from Unsplash for cities/neighborhoods
 * that don't have custom uploads yet.
 * 
 * Usage:
 *   node scripts/fetchUnsplash.js
 *   node scripts/fetchUnsplash.js --city tokyo
 */

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const UNSPLASH_ACCESS_KEY = process.env.VITE_UNSPLASH_ACCESS_KEY || 'YOUR_KEY_HERE';

// Locations to fetch (from your cityData.ts)
const LOCATIONS = {
  cities: [
    { name: 'Tokyo', query: 'tokyo japan street shibuya' },
    { name: 'Osaka', query: 'osaka japan dotonbori' },
    { name: 'Kyoto', query: 'kyoto japan temple' },
    { name: 'Fukuoka', query: 'fukuoka japan' },
    { name: 'Nagoya', query: 'nagoya japan' },
    { name: 'Yokohama', query: 'yokohama japan' },
    { name: 'Sapporo', query: 'sapporo japan' },
    { name: 'Hiroshima', query: 'hiroshima japan peace memorial' },
    { name: 'Kanazawa', query: 'kanazawa japan garden' },
    { name: 'Kobe', query: 'kobe japan harbor' },
  ],
  neighborhoods: [
    { name: 'Shibuya', city: 'Tokyo', query: 'shibuya tokyo crossing' },
    { name: 'Harajuku', city: 'Tokyo', query: 'harajuku tokyo takeshita' },
    { name: 'Shimokitazawa', city: 'Tokyo', query: 'shimokitazawa tokyo' },
    { name: 'Shinjuku', city: 'Tokyo', query: 'shinjuku tokyo' },
    { name: 'Koenji', city: 'Tokyo', query: 'koenji tokyo vintage' },
    { name: 'Nakameguro', city: 'Tokyo', query: 'nakameguro tokyo' },
    { name: 'Daikanyama', city: 'Tokyo', query: 'daikanyama tokyo' },
    { name: 'Aoyama', city: 'Tokyo', query: 'aoyama tokyo fashion' },
    { name: 'Ueno', city: 'Tokyo', query: 'ueno tokyo park' },
    { name: 'Ginza', city: 'Tokyo', query: 'ginza tokyo luxury' },
  ],
};

/**
 * Fetch image from Unsplash
 */
async function fetchUnsplashImage(query, slug, type) {
  try {
    console.log(`  Searching Unsplash: "${query}"`);

    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query,
        per_page: 1,
        orientation: type === 'square' ? 'squarish' : 'portrait',
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.data.results || response.data.results.length === 0) {
      console.log(`  ⚠️  No results found for "${query}"`);
      return null;
    }

    const photo = response.data.results[0];
    const imageUrl = photo.urls.raw;
    const photographer = photo.user.name;
    const photographerUrl = photo.user.links.html;

    console.log(`  ✓ Found image by ${photographer}`);

    // Download image
    const imageResponse = await axios.get(imageUrl, {
      params: {
        w: 1200,
        h: 1200,
        fit: 'crop',
      },
      responseType: 'arraybuffer',
    });

    // Save to original directory
    const outputDir = path.join(
      __dirname,
      `../public/images/${type === 'city' ? 'cities' : 'neighborhoods'}/original`
    );
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `${slug}.jpg`);
    await fs.writeFile(outputPath, imageResponse.data);

    console.log(`  ✓ Saved: ${outputPath}`);

    return {
      photographer,
      photographerUrl,
      unsplashUrl: photo.links.html,
    };
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('  ✗ Unsplash API key invalid or rate limit exceeded');
    } else {
      console.error('  ✗ Error:', error.message);
    }
    return null;
  }
}

/**
 * Convert location name to slug
 */
function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Main execution
 */
async function main() {
  console.log('🌅 Unsplash Fallback Image Fetcher\n');

  if (UNSPLASH_ACCESS_KEY === 'YOUR_KEY_HERE') {
    console.error('❌ Please set VITE_UNSPLASH_ACCESS_KEY in your .env file');
    console.log('\nGet your key at: https://unsplash.com/developers');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const fetchAll = args.includes('--all') || args.length === 0;

  // Fetch cities
  if (fetchAll || args.includes('--cities')) {
    console.log('📍 Fetching city images...\n');
    for (const location of LOCATIONS.cities) {
      const slug = nameToSlug(location.name);
      console.log(`${location.name} (${slug})`);
      await fetchUnsplashImage(location.query, slug, 'city');
      // Rate limiting: wait 1 second between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Fetch neighborhoods
  if (fetchAll || args.includes('--neighborhoods')) {
    console.log('\n🏘️  Fetching neighborhood images...\n');
    for (const location of LOCATIONS.neighborhoods) {
      const slug = nameToSlug(location.name);
      console.log(`${location.name} (${slug})`);
      await fetchUnsplashImage(location.query, slug, 'neighborhood');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log('\n✨ Fetching complete!');
  console.log('\nNext steps:');
  console.log('  1. Run: node scripts/generateImages.js');
  console.log('  2. Review images in public/images/');
}

main();

