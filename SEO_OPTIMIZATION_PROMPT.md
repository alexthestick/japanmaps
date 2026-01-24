# SEO Optimization Task for Lost in Transit JP

## Project Context

**Website:** https://lostintransitjp.com/
**Stack:** React + TypeScript + Vite (Single Page Application)
**Database:** Supabase (PostgreSQL with PostGIS)
**Hosting:** Netlify
**Primary Focus:** Japan vintage/fashion stores, coffee shops, restaurants, museums, and interesting spots

## Current Situation

Google currently only shows the homepage in search results. When users search for individual store names (e.g., "Chicago Vintage Harajuku" or "Kinji Harajuku"), our site does NOT appear, but competitor sites like Tokyo Chuko do.

**Goal:** Make individual store pages rank in Google search results when people search for store names, neighborhoods, or categories.

## Your Mission

You are tasked with comprehensively researching and implementing SEO best practices for this React SPA. Go beyond the initial recommendations below and conduct thorough online research to:

1. **Research current SEO best practices for React SPAs in 2025**
2. **Analyze competitor sites** (Tokyo Chuko, Permanent Style Japan guides, etc.) to understand what makes them rank well
3. **Examine our project structure** (provided below) to understand our routing, data, and component architecture
4. **Implement a complete SEO strategy** including:
   - Server-side rendering or static generation solutions
   - Meta tags and structured data
   - Sitemap generation
   - Internal linking optimization
   - Performance improvements
   - Mobile optimization
   - Any other SEO factors you discover

## Initial SEO Recommendations (Build Upon These)

### 1. Crawlability & Indexing
- **Sitemap:** Generate XML sitemap with all store pages (e.g., `/stores/tokyo-chuko`, `/stores/kinji-harajuku`)
- **Google Search Console:** Submit sitemap and monitor indexing
- **robots.txt:** Ensure crawlers can access all pages

### 2. Page Structure (Per Store)
- **Title Tag:** `<title>Chicago Vintage Harajuku – Best Vintage Store in Tokyo | Lost in Transit</title>`
- **H1 Tag:** `<h1>Chicago Vintage Harajuku</h1>`
- **Meta Description:** Unique, descriptive meta tags for each store page

### 3. Structured Data (Schema.org)
Add LocalBusiness/ClothingStore/Restaurant schema for each store:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  "name": "Chicago Vintage Harajuku",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Harajuku, Tokyo",
    "addressCountry": "JP"
  },
  "url": "https://lostintransitjp.com/stores/chicago-vintage-harajuku",
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "35.6702",
    "longitude": "139.7026"
  },
  "priceRange": "$$",
  "image": ["https://...photo1.jpg", "https://...photo2.jpg"],
  "telephone": "+81-...",
  "openingHoursSpecification": [...],
  "sameAs": ["https://www.instagram.com/...", "https://maps.google.com/?cid=..."]
}
</script>
```

### 4. Internal Linking Structure
Create clear hierarchy:
```
/ (homepage)
├── /cities/tokyo
│   ├── /cities/tokyo/harajuku
│   │   ├── /stores/chicago-vintage-harajuku
│   │   ├── /stores/kinji-harajuku
│   │   └── /stores/flamingo-harajuku
│   ├── /cities/tokyo/shimokitazawa
│   └── /cities/tokyo/koenji
├── /cities/osaka
└── /cities/kyoto
```

### 5. Content Optimization
Each store page should include:
- Detailed text description
- What they sell (specific items, brands, style)
- Neighborhood context
- Address + hours + contact
- Embedded map
- High-quality photos
- Link to Google Maps listing
- Related stores ("You might also like...")

### 6. External Signals
- Research backlink opportunities (fashion blogs, travel guides, Reddit)
- Identify relevant Japan/fashion/vintage communities
- Plan outreach strategy

### 7. Performance & Technical
- Optimize images (WebP, lazy loading)
- Implement code splitting
- Improve Core Web Vitals
- Mobile responsiveness
- Page load speed

## Project Structure Overview

### Key Files & Directories

**Routing:**
- `/src/App.tsx` - Main routing logic (React Router)
- Routes:
  - `/` - Homepage (map view)
  - `/stores/:idOrSlug` - Store detail page
  - `/blog` - Blog posts
  - `/blog/:slug` - Individual blog post
  - `/suggest-store` - Store suggestion form
  - `/admin` - Admin dashboard

**Pages:**
- `/src/pages/HomePage.tsx` - Main map interface
- `/src/pages/StoreDetailPage.tsx` - Individual store pages ⚠️ **PRIMARY SEO TARGET**
- `/src/pages/BlogPage.tsx` - Blog listing
- `/src/pages/BlogPostPage.tsx` - Individual blog posts ⚠️ **SECONDARY SEO TARGET**

**Data Layer:**
- `/src/lib/supabase.ts` - Database connection
- Database tables:
  - `stores` - All store data (name, address, coordinates, categories, photos, etc.)
  - `blog_posts` - Blog content
  - `neighborhoods` - Neighborhood data

**Store Data Structure:**
```typescript
interface Store {
  id: string;
  name: string;
  address: string;
  city: string; // Tokyo, Osaka, Kyoto, etc.
  neighborhood?: string; // Harajuku, Shibuya, etc.
  country: string; // Japan
  latitude: number;
  longitude: number;
  mainCategory: 'Fashion' | 'Food' | 'Coffee' | 'Home Goods' | 'Museum' | 'Spots';
  categories: string[]; // Sub-categories like 'vintage', 'streetwear', etc.
  priceRange?: '$' | '$$' | '$$$';
  description?: string;
  photos: string[]; // URLs to store photos
  website?: string;
  instagram?: string;
  hours?: string;
  verified: boolean;
  google_place_id?: string; // Google Maps Place ID
}
```

**Available Store Categories:**
- **Fashion:** archive, vintage, secondhand, streetwear, designer, luxury, avant-garde, military, antiques, stationery, flagship, concept store, womenswear, select shop
- **Food:** Ramen, Sushi, Izakaya, Kaiseki, Yakitori, Tempura, Udon/Soba, Tonkatsu, Yakiniku, Cafe/Restaurant, Bakery, Dessert, Street Food, Fine Dining, Pizza, Burger, Curry, Okonomiyaki, Bar, Japanese, Western, Asian, Foreign
- **Coffee:** No subcategories
- **Home Goods:** Antiques, Homeware, Furniture, Art, General Stores, Stationery, Toys
- **Museum:** No subcategories
- **Spots:** No subcategories

**Helper Functions:**
- `/src/utils/helpers.ts` - Contains `generateSlug(name, city)` for creating URL-friendly slugs

**Constants:**
- `/src/lib/constants.ts` - All categories, cities, neighborhoods, coordinates

### Cities Covered
Tokyo, Osaka, Kyoto, Fukuoka, Nagoya, Sapporo, Kanagawa/Yokohama, Hiroshima, Kanazawa, Kobe, Niigata, Chiba, Takamatsu, Fukushima, Okayama, Kojima, Nagano, Toyama

### Tokyo Neighborhoods (Example)
Harajuku, Shibuya, Shimokitazawa, Shinjuku, Daikanyama, Ebisu, Hiroo, Omotesando, Nakameguro, Koenji, Ueno, Ikebukuro, Kichijoji, Aoyama, Nakano, Ginza, Roppongi, and many more...

## Research Tasks

1. **React SPA SEO Solutions:**
   - Research best practices for SEO in Vite/React apps
   - Investigate pre-rendering solutions (react-snap, react-snapshot)
   - Explore SSR options (Vite SSR, Remix, Next.js migration considerations)
   - Look into static site generation for store pages

2. **Competitor Analysis:**
   - Analyze Tokyo Chuko's site structure and SEO strategy
   - Study Permanent Style's Japan guides SEO approach
   - Identify what makes these sites rank for individual store queries

3. **Schema Markup Research:**
   - Find best schema types for our different store categories
   - Research rich results opportunities (reviews, ratings, photos, events)
   - Look into Google Merchant Center integration if applicable

4. **Technical SEO:**
   - Research Netlify-specific SEO optimizations
   - Investigate prerendering services (Prerender.io, Rendertron)
   - Look into dynamic rendering strategies
   - Research canonical URLs for SPA routing

5. **Content Strategy:**
   - Research what content makes store pages rank well
   - Identify keyword opportunities (e.g., "vintage stores tokyo harajuku")
   - Plan blog content strategy to drive traffic

6. **Local SEO:**
   - Research Google My Business integration strategies
   - Investigate local pack ranking factors
   - Look into Japan-specific SEO considerations

## Deliverables Expected

1. **Implementation Plan:**
   - Step-by-step roadmap with priorities
   - Technical approach for each SEO improvement
   - Estimated impact of each change

2. **Code Changes:**
   - Meta tag implementation for all pages
   - Structured data components
   - Sitemap generation script
   - robots.txt configuration
   - Any routing or rendering changes

3. **Configuration:**
   - Netlify configuration updates
   - Build script modifications
   - Any new dependencies needed

4. **Documentation:**
   - SEO best practices guide for the project
   - Instructions for maintaining SEO health
   - Google Search Console setup guide

5. **Content Templates:**
   - SEO-optimized title/description templates
   - Content guidelines for store descriptions
   - Internal linking strategy

## Constraints & Considerations

- **Must maintain** current SPA user experience (fast navigation, interactive map)
- **Must not break** existing functionality
- **Must be** maintainable (not overly complex)
- **Budget-conscious** - prefer free/open-source solutions
- **Performance-first** - SEO improvements should not slow down the site

## Success Metrics

1. Store pages indexed by Google (track via Search Console)
2. Ranking for individual store name queries (e.g., "Chicago Harajuku")
3. Ranking for category + location queries (e.g., "vintage stores harajuku")
4. Improved Core Web Vitals scores
5. Increased organic search traffic

## Getting Started

1. **Thoroughly research** each topic area above
2. **Examine our codebase** to understand current implementation
3. **Propose a comprehensive strategy** before implementing
4. **Implement changes incrementally** with testing
5. **Document everything** for future maintenance

## Important Notes

- Our store detail URLs use slugs: `/stores/store-name-city` (e.g., `/stores/chicago-harajuku`)
- We have a blog that could drive traffic to store pages through internal linking
- We have Google Place IDs for many stores - this could be leveraged
- Our map interface is core to the UX - don't compromise it for SEO
- We have multiple store categories - SEO strategy may differ per category

---

**Please conduct thorough research and provide a comprehensive SEO optimization strategy that goes well beyond these initial recommendations. Think like an SEO expert in 2025 working with a modern React application.**
