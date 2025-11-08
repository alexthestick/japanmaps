# 🗺️ Japan Clothing Map - Complete Project Status

**Last Updated:** November 7, 2025

This document provides a comprehensive overview of the current state of the Japan Clothing Map project, including all implemented features, architecture details, and setup requirements.

---

## 📊 Project Overview

**Japan Clothing Map** is a production-ready web application that helps users discover archive, vintage, and streetwear stores across Japan through an interactive map interface with advanced filtering capabilities.

### Current Phase
✅ **Phase 1 Complete (MVP + Polish + Mobile Optimization)**
- Core functionality fully implemented
- Production-ready UI/UX (Desktop & Mobile)
- Kirby retro-futuristic aesthetic throughout
- All features tested and working
- Mobile-first filter system with modal selector

### Tech Stack
- **Frontend:** React 18.3 + TypeScript 5.5 + Vite
- **Styling:** Tailwind CSS 3.4
- **Maps:** Mapbox GL JS
- **Backend:** Supabase (PostgreSQL + PostGIS + Storage)
- **Forms:** React Hook Form + Zod validation
- **Routing:** React Router v6

---

## ✨ Implemented Features

### 1. Interactive Map (Mapbox)
- **Location:** `src/components/map/MapView.tsx`
- Full-screen interactive Mapbox map
- Custom store markers with category-based colors
- Pin clustering for performance
- Smooth pan/zoom controls
- Mobile-responsive touch controls

**Pin Colors:**
- Archive: Blue (#3B82F6)
- Vintage: Green (#10B981)
- Secondhand: Purple (#8B5CF6)
- Streetwear: Red (#EF4444)
- Designer: Amber (#F59E0B)
- Luxury: Gold (#D97706)
- Avant-garde: Purple-500 (#A855F7)

### 2. Store Markers
- **Location:** `src/components/map/StoreMarker.tsx`
- Color-coded by primary category
- Drop shadow for visibility
- Hover effect: Scale 1.15x with smooth transition
- Click opens sidebar detail panel

### 3. Advanced Filtering System
- **Location:** `src/components/store/StoreFilters.tsx`
- **Horizontal filter bar layout** (single row on desktop)
- 5 filter types:
  1. **Search Input** - Text search for stores or areas
  2. **City Dropdown** - Filter by major Japanese cities
  3. **Neighborhood Dropdown** - Cascading filter (only shows when city selected)
  4. **Category Dropdown** - Filter by store type
  5. **Price Range Dropdown** - Filter by price level

**Filter Behavior:**
- Inactive dropdowns: Gray background, gray text
- Active dropdowns: Blue background, white text
- Hover state on inactive: Gray-200 background
- Clear button: Red, only visible when filters active
- Smooth fade-in animation on clear button

**Cascading Location Logic:**
- Selecting a city shows neighborhood dropdown
- Changing city resets neighborhood selection
- Clearing city auto-clears neighborhood
- Neighborhoods are pre-defined per city in `LOCATIONS` constant

### 4. Sidebar Detail Panel
- **Location:** `src/components/store/StoreDetail.tsx`
- Slide-in from right (420px desktop, full-width mobile)
- Smooth 300ms animation
- Map remains visible and interactive
- Close methods: X button, backdrop click, Escape key
- **Scrollable content** with smooth scroll behavior

**Panel Contents:**
- Full-width hero image (264px height)
- Store name (text-2xl, bold)
- Category tags (colored pills)
- Address with MapPin icon
- Hours with Clock icon
- Full description
- Photo gallery (3-column grid)
- Action buttons:
  - **Get Directions** (blue, primary)
  - **Visit Website** (white, outlined)
  - **Instagram** (white, outlined)
- All buttons have hover lift effect + shadow

### 5. Empty State
- **Location:** `src/pages/HomePage.tsx`
- Shows when no stores match filters
- Friendly message: "No stores found"
- Suggestion: "Try adjusting your filters to see more results"
- Centered in main content area

### 6. Map/List Toggle View
- **Location:** `src/pages/HomePage.tsx`
- Toggle between map and list view
- Persistent filter state across views
- Button states: Active (blue) vs Inactive (gray)

### 7. Store List View
- **Location:** `src/components/store/StoreList.tsx`
- Grid layout of store cards
- Responsive: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- Each card shows: image, name, city, categories, price

### 8. Data Fetching & State Management
- **Location:** `src/hooks/useStores.ts`
- Custom React hook for store data
- Uses Supabase RPC function `get_stores_with_coordinates()`
- Client-side filtering (since RPC doesn't support query builders)
- Real-time filter updates
- Loading and error states

**Filter Logic Flow:**
1. Fetch all stores from RPC function (includes lat/lng)
2. Apply country filter (if any)
3. Apply city filter (if any)
4. Apply neighborhood filter (if any)
5. Apply category filter (overlaps check)
6. Apply price range filter
7. Apply search query (name or city)
8. Transform to Store type
9. Update state

### 9. Database Schema (Supabase)

**Tables:**
- `stores` - Main store data
- `store_suggestions` - Public submissions
- `blog_posts` - Blog content
- `profiles` - User profiles (for Phase 2)

**Key Fields in `stores`:**
- `id` (uuid, primary key)
- `name` (text)
- `address` (text)
- `city` (text)
- `neighborhood` (text) - Added in Phase 3
- `country` (text)
- `location` (geography POINT) - PostGIS for lat/lng
- `categories` (text[]) - Array of categories
- `price_range` (text) - $, $$, or $$$
- `description` (text)
- `photos` (text[]) - Array of image URLs
- `website` (text)
- `instagram` (text)
- `hours` (text)
- `verified` (boolean)
- `submitted_by` (uuid, foreign key)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- `haul_count` (integer)
- `save_count` (integer)

**SQL Files:**
1. `001_initial_schema.sql` - Creates tables
2. `002_rls_policies.sql` - Row Level Security
3. `003_sample_stores.sql` - 5 sample stores
4. `004_rpc_functions.sql` - RPC function for coordinate extraction
5. `005_add_neighborhoods.sql` - Adds neighborhood column and updates samples
6. `20251013214941_fix_rpc_add_main_category.sql` - RPC returns main_category & google_place_id
7. `20251013220043_fix_category_casing.sql` - Standardizes category casing and de-duplicates photos
8. `20251014005930_update_main_category_check.sql` - Allows 'Home Goods' and 'Museum'

### 11. New Categories (Phase 8)
- Main categories: Home Goods (🏠), Museum (🏛️)
- Home Goods subcategories: Antiques, Homeware, Furniture, Art, General Stores, Stationery
- Museum: no subcategories
- Map colors/icons wired across markers, legend, filters, forms

### 12. AI Enhancements
- Gemini prompts rewritten to avoid referencing reviews directly
- Enforces 4-part structure: what it is, what you can find, what makes it special, why visit
- Edit form passes selected main category into enhancer

### 13. Cities & Neighborhoods
- Added cities: Hiroshima, Kanazawa, Kobe, Niigata, Chiba, Takamatsu, Fukushima, Kanagawa / Yokohama, Okayama, Kojima
- Tokyo neighborhoods updated: added Ebisu, Hiroo, Jimbocho, Yutenji, Gakugei-Daigaku, Asakusa, Asakusabashi, Meguro City, Kiyosumi-shirakawa; removed Chiba
- Osaka: added Nakazakicho
- Fukuoka: neighborhoods cleared

### 14. Map Behavior
- Prevent auto-zoom on category change; only zoom on searches or single result
- Subcategory coloring only when main category selected (Fashion/Home Goods)

### 15. Mobile-First Features (November 2025)

#### **Landing Page - Jukebox-Style Menu**
- **Location:** `src/components/landing/TrainTicketMenu.tsx`
- Transformed from scattered tickets to organized grid layout
- Jukebox selection codes (A1-D2) for each ticket
- Two sections: Navigation (Map, List, Cities, Neighborhoods, Blog) and Categories (Fashion, Food, Coffee, Home Goods, Museums)
- 3-column grid on desktop, 1-column on mobile
- Glowing borders and enhanced hover effects

#### **Cities Page - Mobile Travel Button**
- **Location:** `src/pages/CitiesPage.tsx`
- Moved "Travel to City" button below preview panel on mobile (previously overlapping)
- Desktop: Button overlays preview panel at bottom
- Mobile: Button positioned below preview panel for better UX
- Pagination dots now fully visible on mobile

#### **City & Neighborhood Pages - Unified Mobile Filter System**
- **Location:** `src/components/filters/MobileLocationCategoryFilters.tsx`
- **Shared component** used by both CityPage and NeighborhoodPage
- **Modal-based location selector** (better than horizontal scroll for many cities/neighborhoods)
  - Tap button to open modal from bottom
  - Organized sections: "Back to City" (when in neighborhood), Neighborhoods, All Cities
  - Glowing active states with city colors
  - Smooth slide-up animation
- **Category filter** with horizontal scrollable pills
  - All, Fashion, Food, Coffee, Home Goods, Museum
  - Icons + glowing purple borders when active
- **Removed back buttons** from both City and Neighborhood pages
- **Desktop sidebar hidden on mobile**, replaced with mobile filters
- **Search and sort controls** desktop-only
- **2-column store grid** on mobile (consistent across all list views)

#### **Neighborhoods Grid Page - Mobile Redesign**
- **Location:** `src/pages/NeighborhoodsPage.tsx`
- Glowing borders and corner decorations (Melee-style)
- Animated border effects on hover
- Category icons in corner badges
- 2-column grid on mobile, responsive columns on desktop

#### **Blog & Article Pages - Mobile Image Sizing**
- **Location:** `src/pages/BlogPage.tsx`, `src/pages/BlogPostPage.tsx`, `src/components/common/ParallaxGuideSection.tsx`
- Responsive image aspect ratios (16:9 mobile, fixed heights desktop)
- Orientation-based sizing for parallax store photos (700-800px based on description length)
- Improved photo visibility in articles

### 16. Kirby Retro-Futuristic Aesthetic
- **Film grain overlay** throughout application
- **Glowing borders** with cyan/blue/purple gradients
- **Text shadows** with neon glow effects
- **Animated hover states** with scale and glow transitions
- **Corner decorations** inspired by Super Smash Bros Melee
- **Gradient backgrounds** from black through gray-900
- **Category-based color theming** (city colors, category colors)
- **Train ticket and jukebox-inspired** navigation elements

### 10. RPC Function (Critical!)
- **File:** `supabase/004_rpc_functions.sql`
- **Name:** `get_stores_with_coordinates()`
- **Purpose:** Extracts lat/lng from PostGIS geography type
- Uses `ST_X()` and `ST_Y()` to convert geography to decimal degrees
- Returns all store fields + latitude + longitude as separate columns

**Why this is needed:**
PostGIS stores coordinates in binary WKB format. The RPC function converts this to usable decimal coordinates on the database side, avoiding the need for client-side parsing.

---

## 🏗️ Project Architecture

### Component Hierarchy
```
App.tsx
├── Layout.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── NewLandingPage.tsx (no layout, full-screen)
│   ├── TrainTicketMenu.tsx (jukebox-style grid)
│   ├── CitiesCarousel.tsx
│   └── StatsBar.tsx
├── CitiesPage.tsx (no layout, full-screen transit card style)
│   └── (city preview cards with swipe carousel)
├── NeighborhoodsPage.tsx (no layout, full-screen Melee-style)
│   └── (neighborhood grid with preview panel)
├── CityPage.tsx (with layout)
│   ├── MobileLocationCategoryFilters.tsx (mobile only)
│   ├── ListViewSidebar.tsx (desktop only)
│   ├── SortDropdown.tsx (desktop only)
│   └── StoreList.tsx (2-col mobile, 2-3-col desktop)
│       └── StoreCard.tsx (multiple)
├── NeighborhoodPage.tsx (with layout)
│   ├── MobileLocationCategoryFilters.tsx (mobile only)
│   ├── ListViewSidebar.tsx (desktop only)
│   ├── SortDropdown.tsx (desktop only)
│   └── StoreList.tsx (2-col mobile, 2-3-col desktop)
│       └── StoreCard.tsx (multiple)
├── HomePage.tsx (map view, with layout)
│   ├── StoreFilters.tsx (horizontal bar)
│   ├── MapView.tsx
│   │   └── StoreMarker.tsx (multiple)
│   ├── StoreList.tsx
│   │   └── StoreCard.tsx (multiple)
│   └── StoreDetail.tsx (sidebar panel)
├── BlogPage.tsx (with layout)
│   └── (blog post cards with responsive images)
├── BlogPostPage.tsx (with layout)
│   └── ParallaxGuideSection.tsx (orientation-based sizing)
├── AboutPage.tsx
├── SuggestStorePage.tsx
│   └── SuggestStoreForm.tsx
└── AdminDashboard.tsx
    └── AddStoreForm.tsx
```

### Key Constants
**Location:** `src/lib/constants.ts`

```typescript
export const STORE_CATEGORIES = [
  'archive',
  'vintage',
  'secondhand',
  'streetwear',
  'designer',
  'luxury',
  'avant-garde',
] as const;

export const PRICE_RANGES = ['$', '$$', '$$$'] as const;

export const MAJOR_CITIES_JAPAN = [
  'Tokyo',
  'Osaka',
  'Kyoto',
  'Fukuoka',
  'Nagoya',
  'Sapporo',
  'Yokohama',
] as const;

export const LOCATIONS = {
  Tokyo: [
    'Harajuku',
    'Shibuya',
    'Shimokitazawa',
    'Shinjuku',
    'Daikanyama',
    'Omotesando',
    'Nakameguro',
  ],
  Osaka: [
    'Shinsaibashi',
    'Amerikamura',
    'Umeda',
    'Namba',
  ],
  Kyoto: [
    'Downtown',
    'Gion',
    'Kawaramachi',
  ],
  Fukuoka: [
    'Tenjin',
    'Daimyo',
  ],
  Nagoya: ['Sakae'],
} as const;

export const PIN_COLORS = {
  archive: '#3B82F6',
  vintage: '#10B981',
  secondhand: '#8B5CF6',
  streetwear: '#EF4444',
  designer: '#F59E0B',
  luxury: '#D97706',
  'avant-garde': '#A855F7',
} as const;
```

### TypeScript Types
**Location:** `src/types/store.ts`

```typescript
export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  neighborhood?: string;
  country: string;
  latitude: number;
  longitude: number;
  categories: StoreCategory[];
  priceRange?: PriceRange;
  description?: string;
  photos: string[];
  website?: string;
  instagram?: string;
  hours?: string;
  verified: boolean;
  submittedBy?: string;
  createdAt: string;
  updatedAt: string;
  haulCount: number;
  saveCount: number;
}

export interface StoreFilters {
  countries: string[];
  cities: string[];
  categories: StoreCategory[];
  priceRanges: PriceRange[];
  verified?: boolean;
  searchQuery?: string;
  selectedCity?: string | null;
  selectedNeighborhood?: string | null;
  selectedCategory?: string | null;
  selectedPrice?: string | null;
}
```

---

## 🎨 UI/UX Polish (Phase 4)

### Dropdown States
- **Inactive:** `bg-gray-100 text-gray-500 border border-gray-200 font-normal`
- **Active:** `bg-blue-500 text-white border-none shadow-sm font-medium`
- **Hover (inactive):** `hover:bg-gray-200`
- **Transition:** `duration-150`

### Clear Button
- **Color:** Red (`text-red-500 border-red-500`)
- **Hover:** `bg-red-50`
- **Animation:** Fade-in (200ms)
- **Visibility:** Only when filters active

### Map Pins
- **Size:** 40x40px
- **Drop shadow:** `drop-shadow(0 2px 4px rgba(0,0,0,0.2))`
- **Hover:** Scale 1.15x, z-index increase
- **Transition:** 200ms ease

### Sidebar Close Button
- **Icon size:** 32px (w-8 h-8)
- **Touch target:** 40x40px
- **Color:** Gray-500 → Gray-900 on hover
- **Background:** `hover:bg-gray-100`
- **Border-radius:** 6px

### Action Buttons
- **Height:** 48px (good touch target)
- **Border-radius:** 8px
- **Gap:** 12px
- **Hover:** `translateY(-0.5px)` + `shadow-lg`
- **Transition:** 150ms

### Responsive Breakpoints
- **Mobile:** < 768px
- **Desktop:** ≥ 768px
- Filter bar stacks vertically on mobile
- Sidebar becomes full-width on mobile

---

## 🚀 Setup Instructions

### 1. Environment Variables
Create `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_access_token
```

### 2. Supabase Setup
1. Create project at supabase.com
2. Go to SQL Editor
3. Run scripts IN ORDER:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_sample_stores.sql`
   - `004_rpc_functions.sql`
   - `005_add_neighborhoods.sql`
4. Create storage bucket: `store-photos` (public)
5. Copy Project URL and Anon Key to `.env.local`

### 3. Mapbox Setup
1. Sign up at mapbox.com
2. Copy default public token
3. Add to `.env.local`

### 4. Install & Run
```bash
npm install
npm run dev
```

---

## 📁 Key Files Reference

### Core Components
- `src/App.tsx` - Main app with routing
- `src/pages/HomePage.tsx` - Main page (map/list view)
- `src/components/map/MapView.tsx` - Mapbox map
- `src/components/map/StoreMarker.tsx` - Pin markers
- `src/components/store/StoreFilters.tsx` - Filter bar
- `src/components/store/StoreDetail.tsx` - Sidebar panel
- `src/hooks/useStores.ts` - Data fetching hook

### Configuration
- `src/lib/supabase.ts` - Supabase client config
- `src/lib/mapbox.ts` - Mapbox config
- `src/lib/constants.ts` - App constants
- `src/types/store.ts` - TypeScript types

### Styling
- `src/index.css` - Global styles + Tailwind
- `tailwind.config.js` - Tailwind configuration

### Database
- `supabase/001_initial_schema.sql` - Tables
- `supabase/002_rls_policies.sql` - Security
- `supabase/003_sample_stores.sql` - Sample data
- `supabase/004_rpc_functions.sql` - Coordinate extraction
- `supabase/005_add_neighborhoods.sql` - Neighborhood updates

---

## 🔧 Known Issues & Limitations

### Current Limitations
1. **No user authentication** (Phase 2 feature)
2. **No save/wishlist** (Phase 2 feature)
3. **No image upload** in public suggestion form
4. **Admin requires manual authentication** via Supabase

### Browser Compatibility
- **Tested:** Chrome, Safari, Firefox (latest)
- **Mobile:** iOS Safari, Chrome Android
- **Required:** Modern browser with ES6+ support

---

## 📊 Sample Data

**Current Sample Stores (5):**
1. **RAGTAG Harajuku** - Tokyo, Harajuku (Archive, Vintage)
2. **Chicago Harajuku** - Tokyo, Harajuku (Secondhand, Streetwear)
3. **RINKAN Shibuya** - Tokyo, Shibuya (Archive, Vintage)
4. **2nd Street Shimokitazawa** - Tokyo, Shimokitazawa (Secondhand, Vintage)
5. **KINDAL Osaka** - Osaka, Shinsaibashi (Archive, Streetwear)

All samples have:
- Valid Tokyo/Osaka coordinates
- Multiple photos
- Instagram handles
- Operating hours
- Descriptions
- Verified status

---

## 🎯 Feature Status

### ✅ Completed (Phase 1-4 + Mobile Optimization)
- [x] Interactive Mapbox map
- [x] Color-coded store pins
- [x] Pin hover effects
- [x] Horizontal filter bar (desktop)
- [x] City filter dropdown
- [x] Neighborhood cascading dropdown
- [x] Category filter dropdown
- [x] Price filter dropdown
- [x] Search input
- [x] Clear filters button
- [x] Sidebar detail panel
- [x] Smooth animations
- [x] Empty state message
- [x] Map/List toggle
- [x] Responsive design (desktop + mobile)
- [x] PostGIS coordinate extraction
- [x] RPC function for data fetching
- [x] Production polish
- [x] Mobile filter system with modal selector
- [x] Jukebox-style landing page menu
- [x] Kirby retro-futuristic aesthetic
- [x] Mobile-optimized city/neighborhood pages
- [x] 2-column mobile store grids
- [x] Responsive blog image sizing
- [x] Unified mobile navigation

### 🚧 Phase 2 (Planned)
- [ ] User authentication
- [ ] Save/wishlist stores
- [ ] Haul posts
- [ ] User profiles
- [ ] Social features

---

## 📱 Page Title
**Current:** "Japan Clothing Map - Discover Archive & Vintage Stores"

---

## 🔑 Critical Implementation Details

### Why RPC Function?
PostGIS stores coordinates in binary WKB (Well-Known Binary) format. JavaScript cannot easily parse this. The RPC function runs SQL on the database to extract coordinates as decimal numbers.

**Without RPC:** Would need to parse WKB binary in JavaScript (complex, error-prone)
**With RPC:** Database returns clean lat/lng numbers (simple, reliable)

### Why Client-Side Filtering?
Supabase RPC functions don't support the `.filter()`, `.eq()`, etc. query builder methods. So we fetch ALL stores via RPC, then filter in JavaScript.

**Tradeoff:** Slightly more data transfer, but simpler code and full control over filter logic.

### Why Cascading Dropdowns?
Better UX than showing all neighborhoods at once. User workflow:
1. Select city (e.g., "Tokyo")
2. Neighborhood dropdown appears with Tokyo neighborhoods
3. Select neighborhood (e.g., "Harajuku")
4. Map shows only Harajuku stores

---

## 🎨 Design System

### Colors
- **Primary:** Blue-500 (#3B82F6)
- **Error/Clear:** Red-500 (#EF4444)
- **Text Primary:** Gray-900 (#111827)
- **Text Secondary:** Gray-600 (#4B5563)
- **Border:** Gray-200 (#E5E7EB)
- **Background:** Gray-100 (#F3F4F6)

### Typography
- **Headings:** font-bold
- **Body:** font-normal (400)
- **Active States:** font-medium (500)

### Spacing
- **Filter gap:** 12px
- **Button height:** 48px
- **Border radius:** 8px (buttons), 6px (close button)

---

## 📞 Handoff Notes for Claude

### If you need to modify the project:
1. **Never change** core database queries or RPC function
2. **Never modify** PostGIS coordinate extraction logic
3. **Always maintain** horizontal filter bar layout
4. **Keep** sidebar panel (don't revert to modal)
5. **Preserve** cascading dropdown behavior
6. **Don't remove** debug logging in MapView (helps troubleshooting)

### Common Tasks:
- **Add new city:** Update `MAJOR_CITIES_JAPAN` and `LOCATIONS`
- **Add new category:** Update `STORE_CATEGORIES` and `PIN_COLORS`
- **Change map style:** Edit `MAP_STYLE` in `mapbox.ts`
- **Add new store:** Use admin dashboard or run SQL directly

### Testing Checklist:
1. Can you see 4-5 pins on the map?
2. Do filters update the map in real-time?
3. Does clicking a pin open the sidebar?
4. Does the neighborhood dropdown appear when selecting a city?
5. Does the clear button reset all filters?

---

**This project is production-ready and fully functional. All Phase 1-4 features are complete and tested.**

