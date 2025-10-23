# Complete Image System Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Folder Structure](#folder-structure)
4. [Image Processing](#image-processing)
5. [React Components](#react-components)
6. [Utilities](#utilities)
7. [Scripts](#scripts)
8. [Configuration](#configuration)
9. [Workflow](#workflow)
10. [Troubleshooting](#troubleshooting)

## Overview

The Japan Maps Image System is a comprehensive, automated solution for managing, optimizing, and serving images for neighborhoods and cities.

### Key Features

- **Automatic Processing**: Drop images → Get optimized versions
- **Multi-Format**: WebP (modern) + JPG (fallback)
- **Responsive**: Retina-ready with 2x resolution
- **Performance**: Lazy loading, proper sizing, compression
- **Developer Experience**: Hot reload, file watching, type-safe
- **Fallback System**: Unsplash integration for missing images

### Technical Stack

- **Image Processing**: Sharp (Node.js)
- **File Watching**: Chokidar
- **React Components**: TypeScript
- **Build Tool**: Vite
- **API Integration**: Unsplash (optional)

## Architecture

```
Source Images (Original)
         ↓
   Image Processor
    /          \
Tiles (240×240)  Previews (840×1000)
    |                |
  WebP + JPG      WebP + JPG
         ↓
  Image Manifest
         ↓
  React Components
         ↓
    User's Browser
```

### Image Sizes

| Type | Dimensions | Use Case | Quality |
|------|------------|----------|---------|
| Tile | 240×240px | Grid display (120×120 @ 2x) | 85% |
| Preview | 840×1000px | Detail view (420×500 @ 2x) | 85% |
| Original | Any (min 500×500) | Source material | — |

## Folder Structure

```
public/images/
  neighborhoods/
    original/           # Source images (you add these)
      shibuya.jpg
      harajuku.jpg
    tiles/              # Generated 240×240
      shibuya.jpg
      shibuya.webp
      shibuya@2x.jpg    # Retina (future)
      shibuya@2x.webp
    previews/           # Generated 840×1000
      shibuya.jpg
      shibuya.webp
  cities/
    original/
    tiles/
    previews/

src/
  components/
    images/
      OptimizedImage.tsx    # Base component
      LocationTile.tsx      # Grid tile component
      LocationPreview.tsx   # Preview component
  utils/
    imageLoader.ts          # Image loading utilities
    imageManifest.json      # Auto-generated catalog

scripts/
  generateImages.js         # Main image processor
  watchImages.js            # Development file watcher
  fetchUnsplash.js          # Unsplash fallback
  setup.sh                  # One-command setup

docs/
  [Documentation files]
```

## Image Processing

### How It Works

1. **Source Detection**: Scans `original/` folders
2. **Processing**: Uses Sharp to:
   - Resize to target dimensions
   - Convert to WebP + JPG
   - Optimize with 85% quality
   - Maintain aspect ratio (cover mode)
3. **Output**: Saves to `tiles/` and `previews/`
4. **Manifest**: Updates `imageManifest.json`

### Processing Pipeline

```javascript
Original Image (shibuya.jpg, 2000×1500)
         ↓
   Sharp Processor
         ↓
    Tile Path
         ├─> Resize to 240×240 (cover)
         ├─> Convert to WebP @ 85%
         └─> Convert to JPG @ 85%
         ↓
   Preview Path
         ├─> Resize to 840×1000 (cover)
         ├─> Convert to WebP @ 85%
         └─> Convert to JPG @ 85%
         ↓
   Update Manifest
         └─> {name: 'shibuya', hasTile: true, hasPreview: true}
```

### Configuration

```javascript
const config = {
  quality: 85,
  formats: ['webp', 'jpeg'],
  sizes: {
    tile: { width: 240, height: 240 },
    preview: { width: 840, height: 1000 }
  },
  fit: 'cover' // Crop to fill dimensions
};
```

## React Components

### OptimizedImage

Base component with WebP support and lazy loading.

```tsx
import { OptimizedImage } from '@/components/images/OptimizedImage';

<OptimizedImage
  src="/images/neighborhoods/tiles/shibuya.jpg"
  webp="/images/neighborhoods/tiles/shibuya.webp"
  alt="Shibuya"
  width={240}
  height={240}
  className="rounded-xl"
  loading="lazy" // default
/>
```

**Features:**
- Automatic WebP detection with JPG fallback
- Lazy loading
- Type-safe props
- Customizable styling

### LocationTile

Grid tile component (240×240, displayed at 120×120 for retina).

```tsx
import { LocationTile } from '@/components/images/LocationTile';

<LocationTile
  name="shibuya"
  type="neighborhood" // or "city"
  alt="Shibuya neighborhood"
  onClick={() => navigate('/shibuya')}
/>
```

**Features:**
- Automatic path resolution
- Fallback to gradient if image missing
- Click handling
- Hover effects ready

### LocationPreview

Detail preview component (840×1000, displayed at 420×500 for retina).

```tsx
import { LocationPreview } from '@/components/images/LocationPreview';

<LocationPreview
  name="shibuya"
  type="neighborhood"
  alt="Shibuya neighborhood preview"
  className="rounded-2xl"
/>
```

## Utilities

### imageLoader.ts

Utility functions for image loading and manifest access.

```typescript
import { getImagePath, getImageManifest, imageExists } from '@/utils/imageLoader';

// Get optimized image path
const tilePath = getImagePath('shibuya', 'neighborhood', 'tile');
// Returns: '/images/neighborhoods/tiles/shibuya.jpg'

// Check if image exists
const exists = imageExists('shibuya', 'neighborhood', 'tile');

// Get full manifest
const manifest = getImageManifest();
```

### imageManifest.json

Auto-generated catalog of all processed images.

```json
{
  "neighborhoods": {
    "shibuya": {
      "name": "shibuya",
      "hasTile": true,
      "hasPreview": true,
      "formats": ["jpg", "webp"]
    }
  },
  "cities": {
    "tokyo": {
      "name": "tokyo",
      "hasTile": true,
      "hasPreview": true,
      "formats": ["jpg", "webp"]
    }
  },
  "generatedAt": "2025-10-21T12:00:00.000Z"
}
```

## Scripts

### generateImages.js

Main image processing script.

```bash
npm run images:generate
```

**What it does:**
1. Scans `original/` folders
2. Processes each image (tiles + previews)
3. Generates WebP + JPG
4. Updates manifest
5. Logs results

### watchImages.js

Development file watcher with hot reload.

```bash
npm run images:watch
```

**What it does:**
1. Monitors `original/` folders
2. Auto-processes on file add/change
3. Updates manifest in real-time
4. Logs activity

### fetchUnsplash.js

Fallback image fetcher from Unsplash API.

```bash
UNSPLASH_ACCESS_KEY=your_key npm run images:unsplash
```

**What it does:**
1. Reads neighborhood/city list
2. Searches Unsplash for each
3. Downloads high-quality images
4. Saves to `original/`
5. Triggers auto-processing

### setup.sh

One-command installation script.

```bash
bash scripts/setup.sh
```

**What it does:**
1. Installs npm dependencies
2. Creates folder structure
3. Sets up environment variables
4. Runs initial image generation

## Configuration

### package.json Scripts

```json
{
  "scripts": {
    "images:generate": "node scripts/generateImages.js",
    "images:watch": "node scripts/watchImages.js",
    "images:unsplash": "node scripts/fetchUnsplash.js",
    "images:clean": "rm -rf public/images/*/tiles public/images/*/previews"
  }
}
```

### Dependencies

```json
{
  "dependencies": {
    "sharp": "^0.33.0",
    "chokidar": "^3.5.3",
    "node-fetch": "^3.3.2"
  }
}
```

### Environment Variables

```env
# Optional: For Unsplash integration
UNSPLASH_ACCESS_KEY=your_unsplash_api_key
```

## Workflow

### Adding New Images

1. Drop image in `public/images/neighborhoods/original/shibuya.jpg`
2. Run `npm run images:generate` (or use watch mode)
3. Use in components: `<LocationTile name="shibuya" type="neighborhood" />`

### Development Workflow

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Watch for image changes
npm run images:watch

# Now: Drop images → Auto-processed → Hot reloaded
```

### Production Build

Images are static assets in `public/`, automatically included in build.

```bash
npm run build
# Output: dist/images/neighborhoods/tiles/shibuya.webp, etc.
```

## Troubleshooting

### Images not appearing?

1. Check file naming (lowercase, hyphens not spaces)
2. Verify folder structure exists
3. Run `npm run images:generate` manually
4. Check browser console for 404s

### WebP not working?

- WebP is supported in all modern browsers
- Fallback to JPG is automatic via `<picture>` element
- Check `imageManifest.json` to confirm generation

### Sharp installation issues?

```bash
# Rebuild Sharp for your platform
npm rebuild sharp
```

### Manifest not updating?

```bash
# Manually regenerate
npm run images:generate
```

### Performance issues?

- Images are lazy-loaded by default
- WebP provides ~30% smaller file sizes
- Consider CDN for production

---

## Next Steps

- **Integration**: Follow [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- **Architecture**: See [Architecture Diagram](./ARCHITECTURE_DIAGRAM.md)
- **Quick Reference**: Check [Quick Start](./IMAGE_QUICKSTART.md)

**Questions?** Check [Documentation Index](./IMAGE_SYSTEM_INDEX.md) for all resources.
