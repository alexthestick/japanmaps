/**
 * One-time migration script: field-notes Supabase storage → ImageKit
 *
 * What it does:
 *   1. Fetches all field_notes rows where photo_url contains 'supabase'
 *   2. Downloads each image from Supabase storage
 *   3. Uploads it to ImageKit under /field-notes/
 *   4. Updates photo_url in the field_notes table to the new ImageKit URL
 *
 * Run once locally. Safe to re-run — skips any row that already has an
 * ImageKit URL. Does not delete anything from Supabase storage.
 *
 * Usage:
 *   node scripts/migrate-field-notes-to-imagekit.mjs
 */

import { createClient } from '@supabase/supabase-js';
import ImageKit, { toFile } from '@imagekit/nodejs';

// ─── Config — fill in the two secret values before running ─────────────────
const SUPABASE_URL        = 'https://avhtmmmblkjvinhhddzq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'PASTE_SERVICE_ROLE_KEY_HERE';

const IMAGEKIT_PUBLIC_KEY  = 'public_G3qIH3lEGjikReZ7CNzwfofwjMQ=';
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || 'PASTE_IMAGEKIT_PRIVATE_KEY_HERE';
const IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/wscyshoygv';
// ────────────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function migrate() {
  console.log('🔍 Fetching field_notes with Supabase photo URLs...');

  const { data: rows, error } = await supabase
    .from('field_notes')
    .select('id, photo_url')
    .like('photo_url', '%supabase%');

  if (error) {
    console.error('❌ Failed to fetch rows:', error.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('✅ No Supabase photo URLs found — nothing to migrate.');
    return;
  }

  console.log(`📋 Found ${rows.length} images to migrate.\n`);

  let succeeded = 0;
  let failed = 0;

  for (const row of rows) {
    const { id, photo_url } = row;
    console.log(`⬇️  [${id}] Downloading: ${photo_url}`);

    try {
      // 1. Download from Supabase storage
      const buffer = await downloadImage(photo_url);
      console.log(`    Downloaded: ${(buffer.length / 1024).toFixed(1)} KB`);

      // 2. Derive a clean filename from the original URL
      const originalFilename = photo_url.split('/').pop() || `${Date.now()}.jpg`;
      const sanitized = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `migration_${Date.now()}_${sanitized}`;

      // 3. Upload to ImageKit (v7 SDK: imagekit.files.upload)
      console.log(`⬆️  Uploading to ImageKit as: ${fileName}`);
      const uploadResult = await imagekit.files.upload({
        file: await toFile(buffer, fileName),
        fileName,
        folder: '/field-notes/',
        useUniqueFileName: true,
        tags: ['field-notes', 'migration', 'japan-maps'],
      });

      console.log(`    ImageKit URL: ${uploadResult.url}`);

      // 4. Update photo_url in DB
      const { error: updateError } = await supabase
        .from('field_notes')
        .update({ photo_url: uploadResult.url })
        .eq('id', id);

      if (updateError) {
        throw new Error(`DB update failed: ${updateError.message}`);
      }

      console.log(`✅  [${id}] Done.\n`);
      succeeded++;

      // Small delay to avoid hammering ImageKit API
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (err) {
      console.error(`❌  [${id}] Failed: ${err.message}\n`);
      failed++;
    }
  }

  console.log('─────────────────────────────────');
  console.log(`Migration complete.`);
  console.log(`  ✅ Succeeded: ${succeeded}`);
  console.log(`  ❌ Failed:    ${failed}`);

  if (failed > 0) {
    console.log('\nRe-run the script to retry failed images — it skips already-migrated rows.');
  }
}

// Guard against accidental placeholder values
if (
  SUPABASE_SERVICE_KEY === 'PASTE_SERVICE_ROLE_KEY_HERE' ||
  IMAGEKIT_PRIVATE_KEY === 'PASTE_IMAGEKIT_PRIVATE_KEY_HERE'
) {
  console.error('❌ Missing credentials. Set them as environment variables:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=... IMAGEKIT_PRIVATE_KEY=... node scripts/migrate-field-notes-to-imagekit.mjs');
  process.exit(1);
}

migrate();
