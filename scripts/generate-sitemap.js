/**
 * Sitemap Generator for Lost in Transit JP
 *
 * Generates sitemap.xml at build time by fetching all stores from Supabase.
 * Run with: node scripts/generate-sitemap.js
 *
 * This script is automatically run during the build process.
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

// Main categories for category pages
const MAIN_CATEGORIES = [
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Food', slug: 'food' },
  { name: 'Coffee', slug: 'coffee' },
  { name: 'Home Goods', slug: 'home-goods' },
  { name: 'Museum', slug: 'museum' },
  { name: 'Spots', slug: 'spots' },
];

// Subcategories by main category
const SUB_CATEGORIES = {
  fashion: ['archive', 'vintage', 'secondhand', 'streetwear', 'designer', 'luxury', 'avant-garde', 'military', 'antiques', 'stationery', 'flagship', 'concept-store', 'womenswear', 'select-shop'],
  food: ['ramen', 'sushi', 'izakaya', 'kaiseki', 'yakitori', 'tempura', 'udon-soba', 'tonkatsu', 'yakiniku', 'cafe-restaurant', 'bakery', 'dessert', 'street-food', 'fine-dining', 'pizza', 'burger', 'curry', 'okonomiyaki', 'bar'],
  'home-goods': ['antiques', 'homeware', 'furniture', 'art', 'general-stores', 'stationery', 'toys'],
};

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
 * Generate city slug
 */
function cityToSlug(city) {
  return city
    .toLowerCase()
    .replace(/\s*\/\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Generate neighborhood slug
 */
function neighborhoodToSlug(neighborhood) {
  return neighborhood
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Format date for sitemap
 */
function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateSitemap() {
  console.log('Generating sitemap...');

  try {
    // Fetch all stores from Supabase with SEO-relevant fields
    const { data: stores, error } = await supabase
      .from('stores')
      .select('id, name, city, neighborhood, updated_at, created_at, save_count, haul_count, verified, photos, main_category')
      .order('name');

    if (error) {
      throw error;
    }

    console.log(`Found ${stores.length} stores`);

    // Fetch all blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, created_at, published_at')
      .order('published_at', { ascending: false });

    if (blogError) {
      console.warn('Error fetching blog posts:', blogError);
    }

    console.log(`Found ${blogPosts?.length || 0} blog posts`);

    // Get unique cities and neighborhoods
    const cities = new Set();
    const neighborhoods = new Map(); // city -> Set of neighborhoods

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

    console.log(`Found ${cities.size} cities`);

    const today = formatDate(new Date());

    // Build sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/map</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/cities</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/neighborhoods</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/suggest</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- City Pages -->
`;

    // Add city pages
    for (const city of cities) {
      const citySlug = cityToSlug(city);
      xml += `  <url>
    <loc>${SITE_URL}/city/${escapeXml(citySlug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    xml += `
  <!-- Neighborhood Pages -->
`;

    // Add neighborhood pages
    for (const [city, hoods] of neighborhoods) {
      const citySlug = cityToSlug(city);
      for (const neighborhood of hoods) {
        const neighborhoodSlug = neighborhoodToSlug(neighborhood);
        xml += `  <url>
    <loc>${SITE_URL}/city/${escapeXml(citySlug)}/${escapeXml(neighborhoodSlug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    xml += `
  <!-- Category Pages -->
`;

    // Add main category pages
    for (const category of MAIN_CATEGORIES) {
      xml += `  <url>
    <loc>${SITE_URL}/category/${category.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      // Add subcategory pages if they exist
      const subCats = SUB_CATEGORIES[category.slug];
      if (subCats) {
        for (const sub of subCats) {
          xml += `  <url>
    <loc>${SITE_URL}/category/${category.slug}/${sub}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
        }
      }
    }

    xml += `
  <!-- Blog Posts -->
`;

    // Add blog post pages
    if (blogPosts && blogPosts.length > 0) {
      for (const post of blogPosts) {
        const lastmod = formatDate(post.updated_at || post.published_at || post.created_at || new Date());
        xml += `  <url>
    <loc>${SITE_URL}/blog/${escapeXml(post.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    xml += `
  <!-- Store Pages (Primary SEO Target) -->
`;

    // Add store pages with dynamic priority based on engagement and completeness
    for (const store of stores) {
      const slug = generateSlug(store.name, store.city);
      const lastmod = formatDate(store.updated_at || store.created_at || new Date());

      // Calculate priority based on multiple factors
      let priority = 0.6; // Base priority for all stores

      const saveCount = store.save_count || 0;
      const haulCount = store.haul_count || 0;
      const photoCount = (store.photos || []).length;
      const isVerified = store.verified || false;
      const isMajorCity = ['Tokyo', 'Osaka', 'Kyoto'].includes(store.city);

      // Verified stores get highest priority
      if (isVerified) {
        priority = 0.9;
      }
      // High engagement stores in major cities
      else if (isMajorCity && saveCount >= 5) {
        priority = 0.9;
      }
      // Stores with significant engagement
      else if (saveCount >= 10) {
        priority = 0.9;
      }
      // Major city stores with moderate engagement
      else if (isMajorCity && saveCount >= 2) {
        priority = 0.8;
      }
      // Stores with photos and some engagement
      else if (photoCount >= 3 && (saveCount >= 2 || haulCount >= 1)) {
        priority = 0.8;
      }
      // Stores with complete profiles
      else if (photoCount >= 1 && saveCount >= 1) {
        priority = 0.7;
      }

      // Determine changefreq based on engagement
      const changefreq = (saveCount >= 5 || haulCount >= 3) ? 'daily' : 'weekly';

      xml += `  <url>
    <loc>${SITE_URL}/store/${escapeXml(slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    // Write sitemap to public directory
    const outputPath = join(__dirname, '..', 'public', 'sitemap.xml');
    writeFileSync(outputPath, xml, 'utf-8');

    const neighborhoodCount = Array.from(neighborhoods.values()).reduce((acc, set) => acc + set.size, 0);
    const categoryCount = MAIN_CATEGORIES.length + Object.values(SUB_CATEGORIES).flat().length;
    const blogCount = blogPosts?.length || 0;
    const staticPages = 7;
    const totalUrls = stores.length + cities.size + neighborhoodCount + categoryCount + blogCount + staticPages;

    console.log(`Sitemap generated successfully at: ${outputPath}`);
    console.log(`Total URLs: ${totalUrls}`);
    console.log(`  - Static pages: ${staticPages}`);
    console.log(`  - Cities: ${cities.size}`);
    console.log(`  - Neighborhoods: ${neighborhoodCount}`);
    console.log(`  - Categories: ${categoryCount}`);
    console.log(`  - Blog posts: ${blogCount}`);
    console.log(`  - Stores: ${stores.length}`);

  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
