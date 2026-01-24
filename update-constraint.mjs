import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔧 Updating main_category_check constraint...');

// Drop old constraint
const dropSQL = `
ALTER TABLE public.stores
DROP CONSTRAINT IF EXISTS main_category_check;
`;

// Add new constraint with Spots
const addSQL = `
ALTER TABLE public.stores
ADD CONSTRAINT main_category_check
CHECK (main_category IN ('Fashion', 'Food', 'Coffee', 'Home Goods', 'Museum', 'Spots'));
`;

try {
  // Execute drop
  console.log('Dropping old constraint...');
  const { error: dropError } = await supabase.rpc('exec', { sql: dropSQL });
  if (dropError) {
    console.log('Note: Drop constraint may have failed (constraint might not exist):', dropError.message);
  }

  // Execute add
  console.log('Adding new constraint with Spots...');
  const { error: addError } = await supabase.rpc('exec', { sql: addSQL });
  if (addError) {
    console.error('❌ Failed to add constraint:', addError);
    process.exit(1);
  }

  console.log('✅ Successfully updated main_category_check constraint!');
  console.log('   Allowed values: Fashion, Food, Coffee, Home Goods, Museum, Spots');
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
