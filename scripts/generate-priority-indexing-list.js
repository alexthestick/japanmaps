/**
 * Priority Indexing List Generator for Lost in Transit JP
 *
 * Generates a prioritized list of store URLs for manual indexing in Google Search Console.
 * Run with: node scripts/generate-priority-indexing-list.js
 *
 * Output: A text file with top 100 priority store URLs and their stats
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_URL = 'https://lostintransitjp.com';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generate URL-friendly slug from store name and city
 */
function generateSlug(name, city) {
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (city) {
    const citySlug = city
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug.includes(citySlug)) {
      slug = `${slug}-${citySlug}`;
    }
  }

  return slug;
}

/**
 * Calculate priority score for a store
 */
function calculatePriorityScore(store) {
  let score = 0;

  const saveCount = store.save_count || 0;
  const haulCount = store.haul_count || 0;
  const photoCount = (store.photos || []).length;
  const isVerified = store.verified || false;
  const isMajorCity = ['Tokyo', 'Osaka', 'Kyoto'].includes(store.city);
  const hasDescription = store.description && store.description.length > 50;
  const hasWebsite = !!store.website;
  const hasInstagram = !!store.instagram;

  // Verified stores get massive boost
  if (isVerified) score += 100;

  // Engagement scoring
  score += saveCount * 10; // Each save = 10 points
  score += haulCount * 5; // Each haul = 5 points

  // Major city bonus
  if (isMajorCity) score += 30;

  // Completeness bonus
  score += photoCount * 5; // Each photo = 5 points
  if (hasDescription) score += 15;
  if (hasWebsite) score += 10;
  if (hasInstagram) score += 10;

  // Neighborhood specified = more complete
  if (store.neighborhood) score += 5;

  return score;
}

async function generatePriorityList() {
  console.log('Generating priority indexing list...\n');

  try {
    // Fetch all stores with relevant data
    const { data: stores, error } = await supabase
      .from('stores')
      .select('id, name, city, neighborhood, save_count, haul_count, verified, photos, description, website, instagram, main_category')
      .order('save_count', { ascending: false });

    if (error) {
      throw error;
    }

    console.log(`Found ${stores.length} total stores`);

    // Calculate priority scores
    const scoredStores = stores.map(store => ({
      ...store,
      priorityScore: calculatePriorityScore(store),
      slug: generateSlug(store.name, store.city),
      url: `${SITE_URL}/store/${generateSlug(store.name, store.city)}`
    }));

    // Sort by priority score (descending)
    scoredStores.sort((a, b) => b.priorityScore - a.priorityScore);

    // Take top 100
    const top100 = scoredStores.slice(0, 100);

    console.log(`\nTop 100 Priority Stores for Manual Indexing:`);
    console.log(`==========================================\n`);

    // Generate output files
    let textOutput = `Lost in Transit JP - Priority Indexing List
Generated: ${new Date().toISOString()}

INSTRUCTIONS:
1. Submit these URLs to Google Search Console manually
2. Google limits manual indexing requests to ~10-12 per day
3. Start with the top 20, then continue daily
4. URLs are ranked by priority score (engagement + completeness)

TOP 100 PRIORITY URLS:
=====================

`;

    let csvOutput = `Rank,Store Name,City,Neighborhood,URL,Priority Score,Saves,Hauls,Photos,Verified,Has Description,Category\n`;

    top100.forEach((store, index) => {
      const rank = index + 1;
      const photoCount = (store.photos || []).length;
      const hasDesc = store.description && store.description.length > 50 ? 'Yes' : 'No';

      // Text output with details
      textOutput += `${rank}. ${store.name} - ${store.city}\n`;
      textOutput += `   URL: ${store.url}\n`;
      textOutput += `   Score: ${store.priorityScore} | Saves: ${store.save_count || 0} | Hauls: ${store.haul_count || 0} | Photos: ${photoCount}`;
      if (store.verified) textOutput += ` | ✓ VERIFIED`;
      textOutput += `\n\n`;

      // CSV output
      csvOutput += `${rank},"${store.name}","${store.city}","${store.neighborhood || 'N/A'}","${store.url}",${store.priorityScore},${store.save_count || 0},${store.haul_count || 0},${photoCount},${store.verified ? 'Yes' : 'No'},"${hasDesc}","${store.main_category || 'N/A'}"\n`;

      // Console output for top 20
      if (rank <= 20) {
        console.log(`${rank}. ${store.name} (${store.city})`);
        console.log(`   ${store.url}`);
        console.log(`   Score: ${store.priorityScore} | Saves: ${store.save_count || 0} | Photos: ${photoCount}${store.verified ? ' | ✓ VERIFIED' : ''}\n`);
      }
    });

    // Write text file
    const textPath = join(__dirname, '..', 'priority-indexing-list.txt');
    writeFileSync(textPath, textOutput, 'utf-8');

    // Write CSV file
    const csvPath = join(__dirname, '..', 'priority-indexing-list.csv');
    writeFileSync(csvPath, csvOutput, 'utf-8');

    // Write simple URL list for easy copy-paste
    const urlListOutput = top100.map(store => store.url).join('\n');
    const urlListPath = join(__dirname, '..', 'priority-urls-only.txt');
    writeFileSync(urlListPath, urlListOutput, 'utf-8');

    console.log(`\n==========================================`);
    console.log(`✓ Priority list generated successfully!`);
    console.log(`\nFiles created:`);
    console.log(`  1. ${textPath} (detailed list)`);
    console.log(`  2. ${csvPath} (spreadsheet format)`);
    console.log(`  3. ${urlListPath} (URLs only for quick copy-paste)`);
    console.log(`\nPriority Distribution:`);

    const verified = top100.filter(s => s.verified).length;
    const highEngagement = top100.filter(s => (s.save_count || 0) >= 5).length;
    const withPhotos = top100.filter(s => (s.photos || []).length >= 3).length;

    console.log(`  - Verified stores: ${verified}`);
    console.log(`  - High engagement (5+ saves): ${highEngagement}`);
    console.log(`  - Well documented (3+ photos): ${withPhotos}`);
    console.log(`\nRECOMMENDATION: Start with the top 20 URLs above`);

  } catch (error) {
    console.error('Error generating priority list:', error);
    process.exit(1);
  }
}

generatePriorityList();
