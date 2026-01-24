import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read migration file
const migrationPath = join(__dirname, 'supabase/migrations/20260120000000_add_spots_category.sql');
const migrationSQL = readFileSync(migrationPath, 'utf8');

console.log('Running migration...');
console.log(migrationSQL);

// Execute the migration
const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

if (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}

console.log('✅ Migration completed successfully!');
