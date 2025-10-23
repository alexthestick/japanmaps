# Architecture Diagram - Visual System Overview

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         JAPAN MAPS IMAGE SYSTEM                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Developer      │
│  Adds Image     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SOURCE IMAGES (Original)                        │
│  public/images/                                                     │
│    ├── neighborhoods/original/                                      │
│    │     ├── shibuya.jpg                                           │
│    │     └── harajuku.jpg                                          │
│    └── cities/original/                                             │
│          ├── tokyo.jpg                                             │
│          └── osaka.jpg                                             │
└────────┬────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FILE WATCHER (Dev Mode)                        │
│  scripts/watchImages.js                                             │
│  - Monitors original/ folders                                       │
│  - Triggers processing on add/change                                │
│  - Real-time manifest updates                                       │
└────────┬────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    IMAGE PROCESSOR (Sharp)                          │
│  scripts/generateImages.js                                          │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ For each image:                                          │     │
│  │                                                           │     │
│  │  1. Read original file                                   │     │
│  │  2. Extract metadata (dimensions, format)                │     │
│  │                                                           │     │
│  │  3. Generate SQUARE (240×240)                            │     │
│  │     ├─> Resize (fit: cover, position: center)            │     │
│  │     ├─> Convert to WebP @ 85% quality                    │     │
│  │     └─> Convert to JPG @ 85% quality                     │     │
│  │                                                           │     │
│  │  4. Generate PREVIEW (840×1000)                          │     │
│  │     ├─> Resize (fit: cover, position: center)            │     │
│  │     ├─> Convert to WebP @ 85% quality                    │     │
│  │     └─> Convert to JPG @ 85% quality                     │     │
│  │                                                           │     │
│  │  5. Update manifest entry                                │     │
│  └──────────────────────────────────────────────────────────┘     │
└────────┬────────────────────────────────────────────────────────────┘
         │
         ├──────────────────┬──────────────────┬─────────────────────┐
         ▼                  ▼                  ▼                     ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐   ┌─────────────────┐
│ Square Images    │ │Square Images │ │Preview Images│   │ Preview Images  │
│ (WebP)           │ │(JPG Fallback)│ │(WebP)        │   │ (JPG Fallback)  │
│                  │ │              │ │              │   │                 │
│ neighborhoods/   │ │neighborhoods/│ │neighborhoods/│   │ neighborhoods/  │
│ square/          │ │square/       │ │preview/      │   │ preview/        │
│ 240×240          │ │240×240       │ │840×1000      │   │ 840×1000        │
│ ~30KB each       │ │~45KB each    │ │~120KB each   │   │ ~180KB each     │
└──────────────────┘ └──────────────┘ └──────────────┘   └─────────────────┘
         │                  │                  │                     │
         └──────────────────┴──────────────────┴─────────────────────┘
                                    ▼
                    ┌────────────────────────────────┐
                    │     IMAGE MANIFEST (JSON)      │
                    │  src/data/imageManifest.json   │
                    │                                │
                    │  {                             │
                    │    "neighborhoods": {          │
                    │      "shibuya": {              │
                    │        "slug": "shibuya",      │
                    │        "hasCustomImage": true, │
                    │        "square": {             │
                    │          "webp": "/...",       │
                    │          "jpg": "/..."         │
                    │        },                      │
                    │        "preview": {            │
                    │          "webp": "/...",       │
                    │          "jpg": "/..."         │
                    │        }                       │
                    │      }                         │
                    │    }                           │
                    │  }                             │
                    └────────────┬───────────────────┘
                                 ▼
                    ┌────────────────────────────────┐
                    │     REACT UTILITIES            │
                    │  src/utils/imageLoader.ts      │
                    │                                │
                    │  - getImagePath()              │
                    │  - imageExists()               │
                    │  - getImageManifest()          │
                    └────────────┬───────────────────┘
                                 ▼
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
┌──────────────────────────┐              ┌──────────────────────────┐
│  REACT COMPONENTS        │              │  REACT COMPONENTS        │
│  (Grid Tiles)            │              │  (Preview Pane)          │
│                          │              │                          │
│  LocationTile            │              │  LocationPreview         │
│  └─> OptimizedImage      │              │  └─> OptimizedImage      │
│       └─> <picture>      │              │       └─> <picture>      │
│           ├─ WebP source │              │           ├─ WebP source │
│           └─ JPG fallback│              │           └─ JPG fallback│
│                          │              │                          │
│  240×240 display         │              │  840×1000 display        │
│  (120×120 @ 2x retina)   │              │  (420×500 @ 2x retina)   │
└──────────┬───────────────┘              └──────────┬───────────────┘
           │                                         │
           └─────────────────┬───────────────────────┘
                             ▼
                ┌────────────────────────────┐
                │    NEIGHBORHOODS PAGE      │
                │  NeighborhoodsPage.tsx     │
                │                            │
                │  ┌──────────┐  ┌─────────┐│
                │  │ Preview  │  │  Grid   ││
                │  │  Pane    │  │ (8×N)   ││
                │  │          │  │         ││
                │  │ 420×500  │  │ Tiles   ││
                │  │          │  │ 120×120 ││
                │  └──────────┘  └─────────┘│
                └────────────┬───────────────┘
                             ▼
                ┌────────────────────────────┐
                │    USER'S BROWSER          │
                │                            │
                │  - WebP support: Use WebP  │
                │  - No WebP: Use JPG        │
                │  - Lazy loading enabled    │
                │  - Retina display ready    │
                └────────────────────────────┘
```

## Data Flow Diagram

```
DEVELOPMENT MODE:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Add     │───>│ Chokidar │───>│  Sharp   │───>│ Manifest │
│  Image   │    │ Detects  │    │ Process  │    │  Update  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                       │
                                                       ▼
                                                 ┌──────────┐
                                                 │   Hot    │
                                                 │ Reload   │
                                                 └──────────┘

PRODUCTION MODE:
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Build   │───>│  Static  │───>│  User    │
│  Process │    │  Assets  │    │ Download │
└──────────┘    └──────────┘    └──────────┘
```

## Component Hierarchy

```
NeighborhoodsPage
├── Preview Pane
│   └── LocationPreview
│       └── OptimizedImage
│           └── <picture>
│               ├── <source type="image/webp">
│               └── <img src="*.jpg">
│
└── Grid (8 columns)
    └── [LocationTile × N]
        └── OptimizedImage
            └── <picture>
                ├── <source type="image/webp">
                └── <img src="*.jpg">
```

## File System Layout

```
project-root/
│
├── public/images/
│   ├── neighborhoods/
│   │   ├── original/          [Source images - YOU ADD HERE]
│   │   │   ├── shibuya.jpg    (2000×1500, 1.2MB)
│   │   │   └── harajuku.jpg   (1920×1080, 980KB)
│   │   │
│   │   ├── square/            [Auto-generated 240×240]
│   │   │   ├── shibuya.webp   (~30KB)
│   │   │   ├── shibuya.jpg    (~45KB)
│   │   │   ├── harajuku.webp  (~30KB)
│   │   │   └── harajuku.jpg   (~45KB)
│   │   │
│   │   └── preview/           [Auto-generated 840×1000]
│   │       ├── shibuya-preview.webp   (~120KB)
│   │       ├── shibuya-preview.jpg    (~180KB)
│   │       ├── harajuku-preview.webp  (~120KB)
│   │       └── harajuku-preview.jpg   (~180KB)
│   │
│   └── cities/
│       ├── original/
│       ├── square/
│       └── preview/
│
├── src/
│   ├── components/images/
│   │   ├── OptimizedImage.tsx     [Base component]
│   │   ├── LocationTile.tsx       [Grid tile]
│   │   └── LocationPreview.tsx    [Preview pane]
│   │
│   ├── data/
│   │   └── imageManifest.json     [Auto-generated catalog]
│   │
│   ├── utils/
│   │   └── imageLoader.ts         [Helper functions]
│   │
│   └── pages/
│       └── NeighborhoodsPage.tsx  [Uses components]
│
└── scripts/
    ├── generateImages.js          [Main processor]
    ├── watchImages.js             [Dev mode watcher]
    ├── fetchUnsplash.js           [Fallback fetcher]
    └── setup.sh                   [One-command setup]
```

## Processing Pipeline Detail

```
INPUT: shibuya.jpg (2000×1500, 1.2MB)
│
├─────> SQUARE PATH
│       │
│       ├─> sharp(input)
│       │   .resize(240, 240, { fit: 'cover', position: 'center' })
│       │   .webp({ quality: 85 })
│       │   .toFile('square/shibuya.webp')
│       │   → Result: 240×240, ~30KB
│       │
│       └─> sharp(input)
│           .resize(240, 240, { fit: 'cover', position: 'center' })
│           .jpeg({ quality: 85, progressive: true })
│           .toFile('square/shibuya.jpg')
│           → Result: 240×240, ~45KB
│
└─────> PREVIEW PATH
        │
        ├─> sharp(input)
        │   .resize(840, 1000, { fit: 'cover', position: 'center' })
        │   .webp({ quality: 85 })
        │   .toFile('preview/shibuya-preview.webp')
        │   → Result: 840×1000, ~120KB
        │
        └─> sharp(input)
            .resize(840, 1000, { fit: 'cover', position: 'center' })
            .jpeg({ quality: 85, progressive: true })
            .toFile('preview/shibuya-preview.jpg')
            → Result: 840×1000, ~180KB

MANIFEST UPDATE:
{
  "neighborhoods": {
    "shibuya": {
      "slug": "shibuya",
      "hasCustomImage": true,
      "square": {
        "webp": "/images/neighborhoods/square/shibuya.webp",
        "jpg": "/images/neighborhoods/square/shibuya.jpg"
      },
      "preview": {
        "webp": "/images/neighborhoods/preview/shibuya-preview.webp",
        "jpg": "/images/neighborhoods/preview/shibuya-preview.jpg"
      }
    }
  }
}
```

## Browser Loading Flow

```
1. React renders <LocationTile name="shibuya" />

2. Component generates paths:
   - webp: /images/neighborhoods/square/shibuya.webp
   - jpg:  /images/neighborhoods/square/shibuya.jpg

3. Renders <picture> element:
   <picture>
     <source srcSet="/...shibuya.webp" type="image/webp" />
     <img src="/...shibuya.jpg" />
   </picture>

4. Browser decision tree:
   ┌─ Supports WebP? ─┬─ YES ──> Load .webp (~30KB)
   │                  │
   │                  └─ NO ───> Load .jpg (~45KB)
   │
   └─ Lazy loading:
      - In viewport? ──> Load immediately
      - Out of view? ──> Load when scrolling near

5. Display at 120×120 (Retina ready at 240×240 actual)
```

## Development vs Production

### Development Mode
```
┌─────────────────┐
│ npm run dev     │  Terminal 1: Vite dev server
└─────────────────┘

┌─────────────────┐
│ npm run         │  Terminal 2: File watcher
│ images:watch    │  - Auto-process new images
└─────────────────┘  - Hot reload on changes

Developer adds image ──> Chokidar detects ──> Sharp processes ──> Vite hot reloads
```

### Production Mode
```
┌─────────────────┐
│ npm run         │  Generate all images once
│ images:generate │
└─────────────────┘
         ↓
┌─────────────────┐
│ npm run build   │  Build static assets
└─────────────────┘
         ↓
┌─────────────────┐
│ Deploy dist/    │  All images included in build
└─────────────────┘
```

## Performance Metrics

| Metric | Before Optimization | After Optimization | Improvement |
|--------|-------------------|-------------------|-------------|
| Tile Size | ~500KB (original) | ~30KB (WebP) | 94% smaller |
| Preview Size | ~1.2MB (original) | ~120KB (WebP) | 90% smaller |
| Page Load | 20+ MB (40 images) | ~1.2 MB (40 tiles) | 94% faster |
| Browser Support | JPG only | WebP + JPG fallback | Modern + Legacy |

## Fallback Strategy

```
PRIMARY: Custom Images
         ↓
         Has custom image?
         ├─ YES ──> Use optimized WebP/JPG
         │
         └─ NO ──┬──> Try Unsplash API
                 │    (if configured)
                 │
                 └──> Use gradient fallback
                      (CSS background)
```

---

## Quick Reference

- **Add Image**: Drop in `original/` folder
- **Process**: `npm run images:generate`
- **Watch**: `npm run images:watch`
- **Use**: `<LocationTile name="shibuya" type="neighborhood" />`
- **Sizes**: 240×240 (tiles), 840×1000 (previews)
- **Formats**: WebP (primary), JPG (fallback)
- **Quality**: 85% (good balance)

**See Also:**
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Complete Documentation](./IMAGE_SYSTEM.md)
- [Quick Start](./IMAGE_QUICKSTART.md)
