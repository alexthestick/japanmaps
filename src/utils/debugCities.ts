import { supabase } from '../lib/supabase';

/**
 * Debug function to see all unique city names in the database
 */
export async function debugCityNames() {
  const { data: stores } = await supabase
    .from('stores')
    .select('city, country');

  if (!stores) return;

  // Get unique cities
  const cities = [...new Set(stores.map(s => s.city))];

  console.log('=== ALL CITIES IN DATABASE ===');
  console.log(cities);
  console.log('==============================');

  // Count per city
  const counts: Record<string, number> = {};
  stores.forEach(store => {
    counts[store.city] = (counts[store.city] || 0) + 1;
  });

  console.log('=== STORE COUNTS PER CITY ===');
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([city, count]) => {
      console.log(`${city}: ${count} stores`);
    });
  console.log('==============================');
}
