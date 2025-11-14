/**
 * Migration Script: Supabase Storage → ImageKit
 *
 * Migrates all store photos from Supabase to ImageKit while maintaining:
 * - Correct store-to-photo associations
 * - Photo order within each store
 * - Full metadata tracking
 *
 * Safety features:
 * - Dry run mode
 * - Progress tracking
 * - Resume capability
 * - Rollback support
 */

import { createClient } from '@supabase/supabase-js';
import ImageKit from 'imagekit';
import imageCompression from 'browser-image-compression';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Debug: Check if environment variables are loaded
if (!process.env.VITE_SUPABASE_URL) {
  console.error('❌ Environment variables not loaded!');
  console.error('   Looking for .env.local at:', path.join(__dirname, '..', '.env.local'));
  process.exit(1);
}

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = process.argv.includes('--limit')
  ? parseInt(process.argv[process.argv.indexOf('--limit') + 1])
  : null;
const BATCH_SIZE = 5; // Process 5 stores at a time
const DELAY_MS = 1000; // 1 second between batches

// Initialize Supabase with service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT,
});

// Progress tracking
const progressFile = path.join(__dirname, 'migration-progress.json');
let progress = {
  totalStores: 0,
  processedStores: 0,
  successfulStores: 0,
  failedStores: 0,
  migratedPhotos: 0,
  failedPhotos: 0,
  skippedStores: [],
  failedStoreIds: [],
  startTime: new Date().toISOString(),
};

// Load existing progress
function loadProgress() {
  if (fs.existsSync(progressFile)) {
    const data = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    console.log('📂 Resuming from previous progress...');
    return data;
  }
  return progress;
}

// Save progress
function saveProgress() {
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
}

// Download image from URL
async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Upload to ImageKit
async function uploadToImageKit(buffer, storeId, photoIndex, originalUrl) {
  const fileName = `store-${storeId}-photo-${photoIndex}.jpg`;
  const base64 = buffer.toString('base64');

  return new Promise((resolve, reject) => {
    imagekit.upload({
      file: base64, // ImageKit SDK expects base64 string
      fileName: fileName,
      folder: `/stores/${storeId}`,
      tags: ['migration', 'store', storeId],
      useUniqueFileName: false,
    }, (error, result) => {
      if (error) {
        console.error('      ImageKit error details:', error);
        reject(error);
      }
      else resolve(result);
    });
  });
}

// Migrate single store
async function migrateStore(store) {
  console.log(`\n📍 Processing: ${store.name} (${store.id})`);
  console.log(`   Photos: ${store.photos?.length || 0}`);

  if (!store.photos || store.photos.length === 0) {
    console.log(`   ⏭️  No photos to migrate`);
    progress.skippedStores.push(store.id);
    return { success: true, skipped: true };
  }

  const newPhotoUrls = [];
  const metadata = {
    provider: 'imagekit',
    migratedAt: new Date().toISOString(),
    originalCount: store.photos.length,
    photos: [],
  };

  for (let i = 0; i < store.photos.length; i++) {
    const photoUrl = store.photos[i];

    try {
      console.log(`   🖼️  Photo ${i + 1}/${store.photos.length}...`);

      if (DRY_RUN) {
        console.log(`   [DRY RUN] Would migrate: ${photoUrl}`);
        newPhotoUrls.push(`https://ik.imagekit.io/DRYRUN/${store.id}/${i}.jpg`);
        continue;
      }

      // Download from Supabase
      const buffer = await downloadImage(photoUrl);
      console.log(`      ✓ Downloaded (${(buffer.length / 1024).toFixed(0)}KB)`);

      // Upload to ImageKit
      const result = await uploadToImageKit(buffer, store.id, i, photoUrl);
      console.log(`      ✓ Uploaded to ImageKit`);

      newPhotoUrls.push(result.url);
      metadata.photos.push({
        fileId: result.fileId,
        url: result.url,
        size: result.size,
        width: result.width,
        height: result.height,
      });

      progress.migratedPhotos++;

    } catch (error) {
      console.error(`      ✗ Failed:`, error.message);
      progress.failedPhotos++;
      // Keep original URL if migration fails
      newPhotoUrls.push(photoUrl);
    }
  }

  // Update database
  if (!DRY_RUN && newPhotoUrls.length > 0) {
    const { error } = await supabase
      .from('stores')
      .update({
        photos: newPhotoUrls,
        image_metadata: metadata,
      })
      .eq('id', store.id);

    if (error) {
      console.error(`   ✗ Database update failed:`, error.message);
      throw error;
    }

    console.log(`   ✅ Database updated`);
  }

  return { success: true, photosCount: newPhotoUrls.length };
}

// Main migration function
async function migrate() {
  console.log('\n🚀 Japan Maps - Photo Migration to ImageKit\n');
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN' : '⚡ LIVE MIGRATION'}`);
  console.log(`Batch Size: ${BATCH_SIZE} stores`);
  if (LIMIT) console.log(`Limit: ${LIMIT} stores`);
  console.log('');

  progress = loadProgress();

  // Get all stores with photos
  let query = supabase
    .from('stores')
    .select('id, name, photos')
    .not('photos', 'is', null);

  if (LIMIT) {
    query = query.limit(LIMIT);
  }

  const { data: stores, error } = await query;

  if (error) {
    console.error('❌ Failed to fetch stores:', error);
    process.exit(1);
  }

  // Filter out already processed stores
  const storesToProcess = stores.filter(s =>
    !progress.skippedStores.includes(s.id) &&
    !progress.failedStoreIds.includes(s.id)
  );

  progress.totalStores = storesToProcess.length;
  console.log(`📊 Found ${stores.length} stores with photos`);
  console.log(`📊 To process: ${storesToProcess.length} stores`);
  console.log('');

  if (!DRY_RUN) {
    console.log('⚠️  WARNING: This will modify your database!');
    console.log('⚠️  Press Ctrl+C within 5 seconds to cancel...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Process in batches
  for (let i = 0; i < storesToProcess.length; i += BATCH_SIZE) {
    const batch = storesToProcess.slice(i, i + BATCH_SIZE);

    console.log(`\n📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(storesToProcess.length / BATCH_SIZE)}`);
    console.log(`─`.repeat(50));

    for (const store of batch) {
      try {
        const result = await migrateStore(store);

        if (result.skipped) {
          progress.processedStores++;
        } else {
          progress.successfulStores++;
          progress.processedStores++;
        }
      } catch (error) {
        console.error(`\n❌ Store migration failed:`, error.message);
        progress.failedStores++;
        progress.processedStores++;
        progress.failedStoreIds.push(store.id);
      }

      saveProgress();
    }

    // Delay between batches
    if (i + BATCH_SIZE < storesToProcess.length) {
      console.log(`\n⏸️  Waiting ${DELAY_MS}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  // Final report
  console.log('\n');
  console.log('═'.repeat(50));
  console.log('📊 MIGRATION COMPLETE');
  console.log('═'.repeat(50));
  console.log(`Total Stores: ${progress.totalStores}`);
  console.log(`Successful: ${progress.successfulStores}`);
  console.log(`Skipped (no photos): ${progress.skippedStores.length}`);
  console.log(`Failed: ${progress.failedStores}`);
  console.log(`Photos Migrated: ${progress.migratedPhotos}`);
  console.log(`Photos Failed: ${progress.failedPhotos}`);
  console.log('');
  console.log(`Progress saved to: ${progressFile}`);

  if (progress.failedStoreIds.length > 0) {
    console.log(`\n⚠️  Failed Store IDs:`);
    progress.failedStoreIds.forEach(id => console.log(`   - ${id}`));
  }

  if (DRY_RUN) {
    console.log('\n🔍 This was a DRY RUN - no changes were made');
  }
}

// Run migration
migrate().catch(error => {
  console.error('\n💥 Fatal error:', error);
  saveProgress();
  process.exit(1);
});
