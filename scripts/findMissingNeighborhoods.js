import { createClient } from '@supabase/supabase-js';
import { LOCATIONS } from '../src/lib/constants.ts';

// Supabase credentials
const supabaseUrl = 'https://avhtmmmblkjvinhhddzq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2aHRtbW1ibGtqdmluaGhkZHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MzQ3MjMsImV4cCI6MjA3NTAxMDcyM30.brC2CbIgMe-XW9yr6xZPRBFGRe5rZxSZ0nLzj-CFipw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findMissingNeighborhoods() {
  console.log('🔍 Finding neighborhoods in database that are missing from LOCATIONS...\n');

  // Fetch all unique city-neighborhood combinations from database
  const { data: stores, error } = await supabase
    .from('stores')
    .select('city, neighborhood');

  if (error) {
    console.error('Error fetching stores:', error);
    return;
  }

  // Build a set of unique neighborhoods per city from database
  const dbNeighborhoods = new Map();
  stores.forEach(store => {
    if (store.neighborhood && store.neighborhood.trim()) {
      if (!dbNeighborhoods.has(store.city)) {
        dbNeighborhoods.set(store.city, new Set());
      }
      dbNeighborhoods.get(store.city).add(store.neighborhood);
    }
  });

  // Compare with LOCATIONS constant
  const missing = [];

  dbNeighborhoods.forEach((neighborhoods, city) => {
    const knownNeighborhoods = LOCATIONS[city] || [];

    neighborhoods.forEach(neighborhood => {
      if (!knownNeighborhoods.includes(neighborhood)) {
        missing.push({ city, neighborhood });
      }
    });
  });

  if (missing.length === 0) {
    console.log('✅ All neighborhoods in database are present in LOCATIONS!');
    return;
  }

  console.log(`📍 Found ${missing.length} missing neighborhoods:\n`);

  // Group by city
  const byCity = {};
  missing.forEach(({ city, neighborhood }) => {
    if (!byCity[city]) byCity[city] = [];
    byCity[city].push(neighborhood);
  });

  Object.entries(byCity).forEach(([city, hoods]) => {
    console.log(`\n${city}:`);
    hoods.sort().forEach(hood => {
      console.log(`  - ${hood}`);
    });
  });

  console.log('\n\n📝 To add these, update src/lib/constants.ts LOCATIONS object:');
  console.log('\nExample:');
  Object.entries(byCity).slice(0, 2).forEach(([city, hoods]) => {
    console.log(`\n  ${city}: [\n    ...existing,\n    ${hoods.map(h => `'${h}'`).join(',\n    ')}\n  ],`);
  });
}

findMissingNeighborhoods();
