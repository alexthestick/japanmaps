/**
 * Get all routes for pre-rendering
 *
 * Fetches stores from Supabase and generates routes for:
 * - Static pages (/, /map, /cities, etc.)
 * - City pages (/city/tokyo, etc.)
 * - Neighborhood pages (/city/tokyo/harajuku, etc.)
 * - Store pages (/store/chicago-harajuku, etc.)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

function cityToSlug(city) {
  return city
    .toLowerCase()
    .replace(/\s*\/\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function neighborhoodToSlug(neighborhood) {
  return neighborhood
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export async function getPrerenderRoutes() {
  console.log('Fetching routes for pre-rendering...');

  // Static routes
  const routes = [
    '/',
    '/map',
    '/cities',
    '/neighborhoods',
    '/blog',
    '/about',
    '/suggest',
  ];

  try {
    // Fetch all stores
    const { data: stores, error } = await supabase
      .from('stores')
      .select('id, name, city, neighborhood')
      .order('name');

    if (error) throw error;

    console.log(`Found ${stores.length} stores`);

    // Collect unique cities and neighborhoods
    const cities = new Set();
    const neighborhoods = new Map();

    stores.forEach(store => {
      if (store.city) {
        cities.add(store.city);
        if (store.neighborhood) {
          if (!neighborhoods.has(store.city)) {
            neighborhoods.set(store.city, new Set());
          }
          neighborhoods.get(store.city).add(store.neighborhood);
        }
      }
    });

    // Add city routes
    for (const city of cities) {
      routes.push(`/city/${cityToSlug(city)}`);
    }

    // Add neighborhood routes
    for (const [city, hoods] of neighborhoods) {
      const citySlug = cityToSlug(city);
      for (const neighborhood of hoods) {
        routes.push(`/city/${citySlug}/${neighborhoodToSlug(neighborhood)}`);
      }
    }

    // Add store routes
    for (const store of stores) {
      const slug = generateSlug(store.name, store.city);
      routes.push(`/store/${slug}`);
    }

    console.log(`Total routes to pre-render: ${routes.length}`);
    return routes;

  } catch (error) {
    console.error('Error fetching routes:', error);
    // Return at least static routes if DB fails
    return routes;
  }
}

// If run directly, print routes
if (process.argv[1].includes('get-prerender-routes')) {
  getPrerenderRoutes().then(routes => {
    console.log('\nRoutes:');
    routes.forEach(r => console.log(r));
  });
}
