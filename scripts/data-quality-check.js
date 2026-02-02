import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDataQuality() {
  console.log('========================================');
  console.log('STORE DATA QUALITY REPORT');
  console.log('========================================\n');

  // Query 1: Stores where neighborhood equals city name
  console.log('1. STORES WHERE NEIGHBORHOOD = CITY NAME');
  console.log('========================================\n');

  const { data: duplicateNameStores, error: error1 } = await supabase
    .from('stores')
    .select('id, name, city, neighborhood')
    .not('neighborhood', 'is', null);

  if (error1) {
    console.error('Error fetching stores:', error1);
  } else {
    // Filter where neighborhood equals city (case-insensitive)
    const matchingStores = duplicateNameStores.filter(store =>
      store.neighborhood && store.neighborhood.toLowerCase() === store.city.toLowerCase()
    );

    // Group by city
    const groupedByCity = matchingStores.reduce((acc, store) => {
      if (!acc[store.city]) {
        acc[store.city] = [];
      }
      acc[store.city].push(store);
      return acc;
    }, {});

    if (matchingStores.length === 0) {
      console.log('No issues found.\n');
    } else {
      console.log(`Total stores with this issue: ${matchingStores.length}\n`);

      Object.keys(groupedByCity).sort().forEach(city => {
        console.log(`\nCity: ${city} (${groupedByCity[city].length} stores)`);
        console.log('-'.repeat(60));
        groupedByCity[city].forEach(store => {
          console.log(`  Store Name: ${store.name}`);
          console.log(`  Store ID:   ${store.id}`);
          console.log(`  City:       ${store.city}`);
          console.log(`  Neighborhood: ${store.neighborhood}`);
          console.log('');
        });
      });
    }
  }

  console.log('\n');

  // Query 2: Stores where neighborhood contains a postal code
  console.log('2. STORES WHERE NEIGHBORHOOD CONTAINS POSTAL CODE');
  console.log('========================================\n');

  const { data: allStores, error: error2 } = await supabase
    .from('stores')
    .select('id, name, city, neighborhood')
    .not('neighborhood', 'is', null);

  if (error2) {
    console.error('Error fetching stores:', error2);
  } else {
    // Filter stores where neighborhood contains postal code patterns
    // Japanese postal codes: XXX-XXXX or starts with digits
    const postalCodePattern = /\d{3}-\d{4}|^\d+/;
    const postalCodeStores = allStores.filter(store =>
      store.neighborhood && postalCodePattern.test(store.neighborhood)
    );

    // Group by city
    const groupedByCity = postalCodeStores.reduce((acc, store) => {
      if (!acc[store.city]) {
        acc[store.city] = [];
      }
      acc[store.city].push(store);
      return acc;
    }, {});

    if (postalCodeStores.length === 0) {
      console.log('No issues found.\n');
    } else {
      console.log(`Total stores with this issue: ${postalCodeStores.length}\n`);

      Object.keys(groupedByCity).sort().forEach(city => {
        console.log(`\nCity: ${city} (${groupedByCity[city].length} stores)`);
        console.log('-'.repeat(60));
        groupedByCity[city].forEach(store => {
          console.log(`  Store Name: ${store.name}`);
          console.log(`  Store ID:   ${store.id}`);
          console.log(`  City:       ${store.city}`);
          console.log(`  Neighborhood: ${store.neighborhood}`);
          console.log('');
        });
      });
    }
  }

  console.log('\n========================================');
  console.log('END OF REPORT');
  console.log('========================================\n');
}

// Run the check
checkDataQuality().catch(console.error);
