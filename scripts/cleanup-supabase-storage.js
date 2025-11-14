import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupSupabaseStorage() {
  console.log('🗑️  Cleaning up Supabase Storage...\n');

  try {
    // List all files in the storage bucket
    const { data: files, error: listError } = await supabase.storage
      .from('storage-photos')
      .list('', {
        limit: 10000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      console.error('Error listing files:', listError);
      return;
    }

    console.log(`📊 Found ${files.length} files in Supabase Storage`);
    
    if (files.length === 0) {
      console.log('✅ Storage already clean!');
      return;
    }

    // Confirm deletion
    console.log('\n⚠️  WARNING: This will DELETE all files from Supabase Storage!');
    console.log('⚠️  Make sure all photos are successfully migrated to ImageKit first!');
    console.log('\nWaiting 10 seconds before deletion...');
    console.log('Press Ctrl+C to cancel!\n');
    
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Delete files in batches
    const batchSize = 100;
    let deleted = 0;
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const filePaths = batch.map(f => f.name);
      
      console.log(`Deleting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)}...`);
      
      const { error: deleteError } = await supabase.storage
        .from('storage-photos')
        .remove(filePaths);

      if (deleteError) {
        console.error('Error deleting batch:', deleteError);
      } else {
        deleted += batch.length;
        console.log(`  ✓ Deleted ${batch.length} files (total: ${deleted}/${files.length})`);
      }
    }

    console.log(`\n✅ Cleanup complete! Deleted ${deleted} files from Supabase Storage`);
    console.log('💡 Storage metrics should update within 1 hour');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

cleanupSupabaseStorage();
