# 🏗️ Image System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    JAPAN MAPS IMAGE SYSTEM                      │
│                     (Production Ready)                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        INPUT SOURCES                            │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐         ┌──────────────┐
    │   Your Own   │         │   Unsplash   │
    │    Photos    │         │     API      │
    │  (Primary)   │         │  (Fallback)  │
    └──────┬───────┘         └──────┬───────┘
           │                        │
           │                        │
           ▼                        ▼
    ┌─────────────────────────────────────┐
    │   public/images/*/original/         │
    │   (1200×1200+ high-res images)      │
    └──────────────┬──────────────────────┘
                   │
                   │
                   ▼

┌─────────────────────────────────────────────────────────────────┐
│                    PROCESSING PIPELINE                          │
└─────────────────────────────────────────────────────────────────┘

         ┌─────────────────────────────┐
         │  scripts/generateImages.js  │
         │                             │
         │  Powered by Sharp (Node.js) │
         └──────────────┬──────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌──────────────┐        ┌──────────────┐
    │   Resize &   │        │   Resize &   │
    │   Optimize   │        │   Optimize   │
    │  240 × 240   │        │  840 × 1000  │
    │   (Square)   │        │  (Preview)   │
    └──────┬───────┘        └──────┬───────┘
           │                       │
           ├─────────┬─────────────┤
           │         │             │
           ▼         ▼             ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │   WebP   │ │   JPG    │ │ + Preview│
    │  (85%)   │ │  (85%)   │ │ versions │
    └──────────┘ └──────────┘ └──────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      OUTPUT & STORAGE                           │
└─────────────────────────────────────────────────────────────────┘

    public/images/
    ├── cities/
    │   ├── square/
    │   │   ├── tokyo.webp      ⚡ 240×240, ~60KB
    │   │   ├── tokyo.jpg       ⚡ 240×240, ~80KB
    │   │   └── ...
    │   └── preview/
    │       ├── tokyo-preview.webp  ⚡ 840×1000, ~150KB
    │       ├── tokyo-preview.jpg   ⚡ 840×1000, ~200KB
    │       └── ...
    └── neighborhoods/
        └── (same structure)

                    +
                    
    src/data/imageManifest.json  📋 Metadata catalog
    
┌─────────────────────────────────────────────────────────────────┐
│                    REACT INTEGRATION                            │
└─────────────────────────────────────────────────────────────────┘

    ┌────────────────────────────────────┐
    │   src/utils/imageLoader.ts         │
    │   - getCityImage()                 │
    │   - getNeighborhoodImage()         │
    │   - Access manifest data           │
    └────────────────┬───────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│ OptimizedImage   │    │   LocationTile   │
│  Component       │◄───│   Component      │
│                  │    │   120×120 tiles  │
│ - WebP support   │    └──────────────────┘
│ - Lazy loading   │
│ - 2x retina      │    ┌──────────────────┐
│ - Fallback       │    │ LocationPreview  │
└──────────────────┘    │   Component      │
                        │   420×500 detail │
                        └──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      USER DISPLAY                               │
└─────────────────────────────────────────────────────────────────┘

    ┌───────────────────────────────────────────┐
    │          Browser (User's Device)          │
    ├───────────────────────────────────────────┤
    │                                           │
    │  🌐 WebP-capable browser (95%+)           │
    │     Loads: tokyo.webp (smaller, faster)   │
    │                                           │
    │  🌐 Older browser (5%)                    │
    │     Loads: tokyo.jpg (fallback)           │
    │                                           │
    │  📱 Retina display                        │
    │     Uses: 2x resolution (sharp!)          │
    │                                           │
    │  ⚡ Lazy loading                          │
    │     Only loads visible images             │
    │                                           │
    └───────────────────────────────────────────┘
```

## Data Flow Diagram

```
USER ACTION                SYSTEM RESPONSE
───────────                ───────────────

1. Drop image.jpg      →   Detected by watchImages.js
   to original/             ↓
                           Auto-trigger generateImages.js
                             ↓
2. Processing...       ←   Sharp resizes & optimizes
                           - 240×240 square (WebP + JPG)
                           - 840×1000 preview (WebP + JPG)
                             ↓
3. Files created       ←   Output to square/ and preview/
                             ↓
4. Manifest updated    ←   imageManifest.json regenerated
                             ↓
5. React refreshes     ←   Vite HMR updates page
                             ↓
6. Images display      ←   OptimizedImage component
                           - Picks WebP or JPG
                           - Lazy loads
                           - Shows skeleton while loading
```

## Component Hierarchy

```
App
│
├── CityPage
│   ├── LocationPreview (Tokyo)          ← 420×500 hero image
│   │   └── OptimizedImage
│   │       ├── <picture>
│   │       │   ├── <source> webp
│   │       │   ├── <source> jpg
│   │       │   └── <img> fallback
│   │       └── Loading skeleton
│   │
│   └── StoreList
│
├── CitiesCarousel
│   └── LocationTile × N                 ← 120×120 grid tiles
│       └── OptimizedImage
│           └── (same structure)
│
└── NeighborhoodGrid
    └── LocationTile × N
        └── (same structure)
```

## File System Layout

```
Japan Maps/
│
├── public/                              # Static assets (deployed as-is)
│   └── images/
│       ├── cities/
│       │   ├── original/                ← YOU: Drop photos here
│       │   ├── square/                  ← AUTO: 240×240 generated
│       │   └── preview/                 ← AUTO: 840×1000 generated
│       └── neighborhoods/
│           └── (same structure)
│
├── src/
│   ├── data/
│   │   └── imageManifest.json          ← AUTO: Generated catalog
│   │
│   ├── utils/
│   │   └── imageLoader.ts              ← API: Load images
│   │
│   └── components/common/
│       ├── OptimizedImage.tsx          ← Base component
│       ├── LocationTile.tsx            ← 120×120 tile
│       └── LocationPreview.tsx         ← 420×500 preview
│
└── scripts/
    ├── generateImages.js               ← Core: Process images
    ├── fetchUnsplash.js                ← Optional: Fetch fallbacks
    ├── watchImages.js                  ← Dev: Auto-process
    └── setup.sh                        ← Install: One-command setup
```

## Technology Stack

```
┌─────────────────────────────────────────────┐
│            Development Stack                │
├─────────────────────────────────────────────┤
│  Node.js     >=18.0.0   Runtime            │
│  Sharp       ^0.33.2    Image processing   │
│  Axios       ^1.6.7     HTTP requests      │
│  Chokidar    ^3.5.3     File watching      │
│  Dotenv      ^16.4.1    Environment vars   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│            Frontend Stack                   │
├─────────────────────────────────────────────┤
│  React       ^18.3.1    UI framework       │
│  Vite        ^5.4.3     Build tool         │
│  TypeScript  ^5.5.3     Type safety        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│            Image Formats                    │
├─────────────────────────────────────────────┤
│  WebP        85% quality   Modern format   │
│  JPG         85% quality   Fallback        │
│  Retina      2x resolution High-DPI        │
└─────────────────────────────────────────────┘
```

## Performance Flow

```
Initial Page Load
─────────────────
1. HTML loads                           ~10KB
2. CSS loads                            ~50KB
3. React bundle loads                   ~200KB
4. Manifest loads (imageManifest.json)  ~5KB
   ↓
5. Visible tiles load (lazy)            ~300KB
   - Above fold: 6 tiles × 50KB
   - WebP format for modern browsers
   ↓
6. Below fold loads as user scrolls     (deferred)
   - Intersection Observer triggers
   ↓
TOTAL INITIAL: ~565KB
TIME TO INTERACTIVE: ~1.5s

Subsequent Navigation
─────────────────────
1. Page loads (cached)                  0KB
2. New images load                      ~300KB
3. Old images from cache                0KB
   ↓
TOTAL: ~300KB
TIME TO INTERACTIVE: ~0.5s
```

## Decision Tree

```
Do you have an image for this location?
│
├─ YES
│  └─ Is it in original/ folder?
│     ├─ YES → generateImages.js processes it
│     └─ NO → Copy it there, run npm run images:generate
│
└─ NO
   └─ Want to fetch from Unsplash?
      ├─ YES
      │  └─ Have API key?
      │     ├─ YES → npm run images:fetch
      │     └─ NO → Get key at unsplash.com/developers
      │
      └─ NO
         └─ Use fallback image (automatic)
```

## Deployment Flow

```
Local Development          Production
─────────────────          ──────────
1. npm run dev        →    1. npm run build
   - Vite dev server          - TypeScript compile
   - HMR enabled              - Vite optimizations
   - No minification          - Asset minification
                              - Content hashing
2. npm run images:watch    
   - Auto-process images   2. Deploy to Vercel/Netlify
   - Watch for changes        - public/ copied to dist/
                              - Serve from CDN
                              - Auto-caching

                           3. Users receive
                              - Optimized images
                              - CDN delivery
                              - Browser caching
```

---

**This architecture is:**
- ✅ Production-ready
- ✅ Scalable (handles 1000s of images)
- ✅ Fast (WebP + lazy loading)
- ✅ Future-proof (easy to extend)
- ✅ Developer-friendly (automated workflows)

