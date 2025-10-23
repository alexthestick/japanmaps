# 🗺️ Japan Clothing Map

A curated map and directory platform for discovering the best clothing stores across Japan - specializing in streetwear, archive, and vintage fashion.

![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue)

---

## ✨ Features

### Phase 1 (Current - MVP)
- 🗺️ **Interactive Mapbox map** with color-coded store pins
- 📋 **List/Map toggle** view (Disneyland app-style UX)
- 🔍 **Advanced filtering** by city, category, and price range
- 📍 **Store detail pages** with photos, directions, and social links
- 💡 **Public suggestion form** for community contributions
- 🔐 **Admin dashboard** for managing stores and suggestions
- 📱 **Fully responsive** mobile design

### Coming in Phase 2
- 👤 User accounts and authentication
- ❤️ Save/wishlist functionality
- 📸 Haul posts (community photos and reviews)
- 🌟 Social features (likes, follows, comments)

---

## 📝 Changelog — October 2025

**Recent progress and current state:**
- Added main categories: **Home Goods (🏠)** and **Museum (🏛️)**
- Added Home Goods subcategories: Antiques, Homeware, Furniture, Art, General Stores, Stationery
- Integrated Google Places + AI into both Add and Edit Store forms (auto-fill, photos, descriptions)
- Refined AI descriptions to avoid direct review references; focus on what it is, what you can find, why it's special
- Fixed `price_range` validation and photo duplication issues
- RPC `get_stores_with_coordinates()` now returns `main_category` and `google_place_id`
- Map behavior: no auto-zoom on filter change; subcategory colors apply only when relevant
- Expanded cities and neighborhoods; combined into **Kanagawa / Yokohama**


## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Mapping**: Mapbox GL JS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel
- **Forms**: React Hook Form + Zod

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_token
```

### 3. Set Up Supabase Database
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL scripts in order:
   - `supabase/001_initial_schema.sql`
   - `supabase/002_rls_policies.sql`
   - `supabase/003_sample_stores.sql` (optional - adds 5 sample stores)
3. Create a storage bucket named `store-photos` (make it public)

### 4. Get a Mapbox Token
1. Sign up at [mapbox.com](https://www.mapbox.com/)
2. Copy your default public token from the dashboard
3. Add it to your `.env.local` file

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

---

## 📂 Project Structure

```
clothing-map/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   ├── layout/          # Header, Footer, Layout
│   │   ├── map/             # Map-related components
│   │   ├── store/           # Store cards, lists, filters
│   │   └── forms/           # Form components
│   ├── pages/               # Route pages
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Configuration (Supabase, Mapbox)
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Helper functions
│   └── App.tsx              # Main app component
├── supabase/                # Database schema and SQL scripts
├── public/                  # Static assets
└── package.json
```

---

## 🎯 Core Components

### Map View
- **MapView.tsx**: Main map component with Mapbox integration
- **StoreMarker.tsx**: Custom pin markers with category-based colors
- Color-coded pins for each store category

### Store Components
- **StoreCard.tsx**: Store preview cards with images and info
- **StoreList.tsx**: Grid layout of store cards
- **StoreDetail.tsx**: Full store detail modal/page
- **StoreFilters.tsx**: Advanced filtering UI

### Forms
- **SuggestStoreForm.tsx**: Public form for store suggestions
- **AddStoreForm.tsx**: Admin form for adding stores
- Form validation with Zod schemas

---

## 🔑 Key Features Explained

### Filter & Search
Users can filter stores by:
- 🏙️ City (major Japanese cities)
- 🏷️ Category (archive, vintage, streetwear, etc.)
- 💰 Price range ($, $$, $$$)
- 🔍 Text search (store name or city)

### Admin Dashboard
Protected route for managing the platform:
- ➕ Add new stores
- 📋 View all store suggestions
- ✅ Approve or reject suggestions
- 🔐 Authentication required

### Store Data Model
Each store includes:
- Name, address, city, neighborhood
- Latitude/longitude (PostGIS geography)
- Categories (array)
- Price range
- Photos (array of URLs)
- Instagram, website links
- Hours, description
- Verified status

---

## 📱 Mobile Responsive

The entire platform is fully responsive:
- Mobile-optimized header with hamburger menu
- Touch-friendly map controls
- Responsive grid layouts
- Optimized modal overlays

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in the Vercel dashboard
4. Deploy!

Vercel will automatically deploy on every push to `main`.

### Build for Production
```bash
npm run build
npm run preview  # Preview the production build
```

---

## 📊 Database Schema

### Main Tables
- **stores**: All store data with PostGIS location
- **store_suggestions**: Public submissions
- **profiles**: User profiles (Phase 2)
- **blog_posts**: Blog content
- **saved_stores**: User wishlists (Phase 2)

See `supabase/001_initial_schema.sql` for the complete schema.

---

## 🎨 Customization

### Change Map Style
Edit `src/lib/mapbox.ts`:
```typescript
export const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';
// Try: dark-v11, outdoors-v12, satellite-v9
```

### Update Pin Colors
Edit `src/lib/constants.ts`:
```typescript
export const PIN_COLORS = {
  archive: '#3B82F6',    // Blue
  vintage: '#10B981',    // Green
  streetwear: '#EF4444', // Red
  // etc.
};
```

### Add New Categories
Edit `src/lib/constants.ts`:
```typescript
export const STORE_CATEGORIES = [
  'archive',
  'vintage',
  'your-category',
] as const;
```

---

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Run TypeScript checks
```

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for consistent styling

---

## 📖 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**: Detailed setup instructions
- **PRD**: Full product requirements (see project folder)
- **Codebase Structure**: Architecture documentation (see project folder)

---

## 🗺️ Roadmap

### Phase 1 - MVP ✅
- [x] Interactive map with store pins
- [x] List/Map toggle view
- [x] Filtering and sorting
- [x] Store detail pages
- [x] Suggestion form
- [x] Admin dashboard
- [x] Responsive design

### Phase 2 - Community (Coming Soon)
- [ ] User authentication
- [ ] Save/wishlist stores
- [ ] Haul posts with photos
- [ ] Community feed
- [ ] User profiles
- [ ] Social features (likes, follows)

### Phase 3 - Advanced Features
- [ ] Trip planning
- [ ] Enhanced search
- [ ] Store recommendations
- [ ] PWA (offline support)
- [ ] Push notifications

---

## 🤝 Contributing

This is currently a personal project, but suggestions are welcome! 

Use the **Suggest a Store** form on the live site to contribute store recommendations.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Mapbox** for amazing map technology
- **Supabase** for the backend infrastructure
- **Tailwind CSS** for rapid UI development
- **React & Vite** for the development experience

---

## 📧 Contact

For questions, feedback, or collaboration:
- Email: hello@example.com
- Twitter: @yourhandle
- YouTube: Your Channel

---

**Built with ❤️ for the streetwear and vintage fashion community**


