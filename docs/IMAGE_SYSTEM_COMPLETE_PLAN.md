# Complete Plan - All 6 Stages Detailed

## Overview

This document outlines all 6 stages of the Japan Maps Image System implementation from scratch to production.

---

## Stage 1: Foundation & Setup

### Duration: 10 minutes

### Objectives
- Install required dependencies
- Create folder structure
- Verify scripts exist

### Tasks

#### 1.1 Install Dependencies
```bash
npm install sharp chokidar node-fetch
```

**Packages:**
- `sharp@^0.33.0` - Image processing (240MB, native binaries)
- `chokidar@^3.5.3` - File system watcher (1.2MB)
- `node-fetch@^3.3.2` - HTTP client for Unsplash (200KB)

**Verification:**
```bash
npm list sharp chokidar node-fetch
```

#### 1.2 Create Directory Structure
```bash
# Neighborhoods
mkdir -p public/images/neighborhoods/original
mkdir -p public/images/neighborhoods/square
mkdir -p public/images/neighborhoods/preview

# Cities
mkdir -p public/images/cities/original
mkdir -p public/images/cities/square
mkdir -p public/images/cities/preview

# React components
mkdir -p src/components/images

# Data/utilities
mkdir -p src/data
```

**Verification:**
```bash
tree public/images -L 2
```

#### 1.3 Verify Scripts
```bash
ls scripts/generateImages.js
# Should exist from documentation
```

#### 1.4 Add Package Scripts

Edit `package.json`:
```json
{
  "scripts": {
    "images:generate": "node scripts/generateImages.js",
    "images:watch": "node scripts/watchImages.js",
    "images:unsplash": "node scripts/fetchUnsplash.js",
    "images:clean": "rm -rf public/images/*/square public/images/*/preview src/data/imageManifest.json"
  }
}
```

### Success Criteria
- [ ] All dependencies installed without errors
- [ ] All folders created
- [ ] Scripts exist and are executable
- [ ] Package.json updated with new scripts

---

## Stage 2: Image Processing Scripts

### Duration: 5 minutes

### Objectives
- Verify `generateImages.js` works
- Create file watcher for development
- Create Unsplash fetcher (optional)
- Create setup script

### Tasks

#### 2.1 Test Image Generator

The script `scripts/generateImages.js` should already exist. Test it:

```bash
# Create a test image
curl -o public/images/neighborhoods/original/test.jpg https://picsum.photos/800/600

# Run generator
npm run images:generate

# Verify output
ls public/images/neighborhoods/square/
ls public/images/neighborhoods/preview/
cat src/data/imageManifest.json
```

**Expected output:**
- `square/test.jpg` and `square/test.webp` (240×240)
- `preview/test-preview.jpg` and `preview/test-preview.webp` (840×1000)
- Updated manifest with test entry

#### 2.2 Create File Watcher

Create `scripts/watchImages.js`:

```javascript
#!/usr/bin/env node

import chokidar from 'chokidar';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const watchPaths = [
  path.join(__dirname, '../public/images/neighborhoods/original'),
  path.join(__dirname, '../public/images/cities/original'),
];

console.log('👀 Watching for image changes...\n');

const watcher = chokidar.watch(watchPaths, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true,
});

watcher
  .on('add', (filePath) => {
    console.log(`\n📸 New image detected: ${path.basename(filePath)}`);
    runGenerator();
  })
  .on('change', (filePath) => {
    console.log(`\n🔄 Image changed: ${path.basename(filePath)}`);
    runGenerator();
  })
  .on('unlink', (filePath) => {
    console.log(`\n🗑️  Image deleted: ${path.basename(filePath)}`);
    runGenerator();
  });

function runGenerator() {
  console.log('⚙️  Processing images...\n');
  exec('node scripts/generateImages.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️  ${stderr}`);
    }
    console.log(stdout);
    console.log('\n✨ Done! Watching for changes...\n');
  });
}

console.log('Watching directories:');
watchPaths.forEach((p) => console.log(`  - ${p}`));
console.log('\nPress Ctrl+C to stop watching.\n');
```

**Test:**
```bash
npm run images:watch
# In another terminal: cp test.jpg public/images/neighborhoods/original/test2.jpg
# Should auto-process
```

#### 2.3 Create Unsplash Fetcher (Optional)

Create `scripts/fetchUnsplash.js`:

```javascript
#!/usr/bin/env node

import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { LOCATIONS, MAJOR_CITIES_JAPAN } from '../src/lib/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!UNSPLASH_ACCESS_KEY) {
  console.error('❌ UNSPLASH_ACCESS_KEY not set in environment');
  process.exit(1);
}

async function fetchImage(query, outputPath) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls.regular;
      const imageResponse = await fetch(imageUrl);
      const buffer = await imageResponse.buffer();
      await fs.writeFile(outputPath, buffer);
      console.log(`✓ Downloaded: ${query}`);
      return true;
    } else {
      console.log(`⚠️  No results for: ${query}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error fetching ${query}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🌄 Fetching images from Unsplash\n');

  // Fetch neighborhoods
  for (const [city, neighborhoods] of Object.entries(LOCATIONS)) {
    for (const hood of neighborhoods) {
      const slug = hood.toLowerCase().replace(/\s+/g, '-');
      const outputPath = path.join(__dirname, `../public/images/neighborhoods/original/${slug}.jpg`);

      // Check if already exists
      try {
        await fs.access(outputPath);
        console.log(`↷ Skipping ${hood} (already exists)`);
        continue;
      } catch {
        // Doesn't exist, fetch it
      }

      await fetchImage(`${hood} ${city} Japan`, outputPath);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
    }
  }

  // Fetch cities
  for (const city of MAJOR_CITIES_JAPAN) {
    const slug = city.toLowerCase().replace(/\s+/g, '-');
    const outputPath = path.join(__dirname, `../public/images/cities/original/${slug}.jpg`);

    try {
      await fs.access(outputPath);
      console.log(`↷ Skipping ${city} (already exists)`);
      continue;
    } catch {
      // Doesn't exist, fetch it
    }

    await fetchImage(`${city} Japan cityscape`, outputPath);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
  }

  console.log('\n✨ Done! Run `npm run images:generate` to process images.');
}

main();
```

#### 2.4 Create Setup Script

Create `scripts/setup.sh`:

```bash
#!/bin/bash

echo "🎨 Japan Maps Image System Setup"
echo "================================="
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install sharp chokidar node-fetch

# Create folder structure
echo "📁 Creating folder structure..."
mkdir -p public/images/neighborhoods/original
mkdir -p public/images/neighborhoods/square
mkdir -p public/images/neighborhoods/preview
mkdir -p public/images/cities/original
mkdir -p public/images/cities/square
mkdir -p public/images/cities/preview
mkdir -p src/components/images
mkdir -p src/data

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x scripts/*.js
chmod +x scripts/*.sh

# Initial image generation
echo "🖼️  Running initial image generation..."
npm run images:generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Add images to public/images/neighborhoods/original/"
echo "  2. Run 'npm run images:generate' to process"
echo "  3. Or run 'npm run images:watch' for auto-processing"
echo ""
```

Make executable:
```bash
chmod +x scripts/setup.sh
```

### Success Criteria
- [ ] Image generator processes test images correctly
- [ ] File watcher detects and processes new images
- [ ] Unsplash fetcher configured (if using)
- [ ] Setup script runs without errors

---

## Stage 3: React Components

### Duration: 15 minutes

### Objectives
- Create base OptimizedImage component
- Create LocationTile for grid
- Create LocationPreview for detail view

### Tasks

#### 3.1 Create OptimizedImage Component

Create `src/components/images/OptimizedImage.tsx`:

```tsx
interface OptimizedImageProps {
  src: string;
  webp: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  onError?: () => void;
}

export function OptimizedImage({
  src,
  webp,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  onError,
}: OptimizedImageProps) {
  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        onError={onError}
      />
    </picture>
  );
}
```

#### 3.2 Create LocationTile Component

Create `src/components/images/LocationTile.tsx`:

```tsx
import { OptimizedImage } from './OptimizedImage';
import { useState } from 'react';

interface LocationTileProps {
  name: string;
  type: 'neighborhood' | 'city';
  alt: string;
  onClick?: () => void;
  className?: string;
}

export function LocationTile({
  name,
  type,
  alt,
  onClick,
  className = '',
}: LocationTileProps) {
  const [imageError, setImageError] = useState(false);
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const basePath = `/images/${type === 'neighborhood' ? 'neighborhoods' : 'cities'}/square`;

  if (imageError) {
    // Fallback gradient
    return (
      <div
        onClick={onClick}
        className={`relative overflow-hidden cursor-pointer bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center ${className}`}
      >
        <span className="text-white text-sm font-medium">{name}</span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer ${className}`}
    >
      <OptimizedImage
        src={`${basePath}/${slug}.jpg`}
        webp={`${basePath}/${slug}.webp`}
        alt={alt}
        width={240}
        height={240}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
```

#### 3.3 Create LocationPreview Component

Create `src/components/images/LocationPreview.tsx`:

```tsx
import { OptimizedImage } from './OptimizedImage';
import { useState } from 'react';

interface LocationPreviewProps {
  name: string;
  type: 'neighborhood' | 'city';
  alt: string;
  className?: string;
}

export function LocationPreview({
  name,
  type,
  alt,
  className = '',
}: LocationPreviewProps) {
  const [imageError, setImageError] = useState(false);
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const basePath = `/images/${type === 'neighborhood' ? 'neighborhoods' : 'cities'}/preview`;

  if (imageError) {
    // Fallback gradient
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center ${className}`}>
        <span className="text-white text-2xl font-medium">{name}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <OptimizedImage
        src={`${basePath}/${slug}-preview.jpg`}
        webp={`${basePath}/${slug}-preview.webp`}
        alt={alt}
        width={840}
        height={1000}
        className="w-full h-full object-cover"
        loading="eager" // Preview should load immediately
        onError={() => setImageError(true)}
      />
    </div>
  );
}
```

### Success Criteria
- [ ] All components compile without TypeScript errors
- [ ] Components handle missing images gracefully
- [ ] WebP detection works correctly
- [ ] Lazy loading functions properly

---

## Stage 4: Utilities & Helpers

### Duration: 10 minutes

### Objectives
- Create image loading utilities
- Set up manifest structure
- Add helper functions

### Tasks

#### 4.1 Create imageLoader Utility

Create `src/utils/imageLoader.ts`:

```typescript
import imageManifest from '../data/imageManifest.json';

export function getImagePath(
  name: string,
  type: 'neighborhood' | 'city',
  size: 'square' | 'preview',
  format: 'webp' | 'jpg' = 'jpg'
): string {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const typeFolder = type === 'neighborhood' ? 'neighborhoods' : 'cities';
  const sizeFolder = size;
  const filename = size === 'preview' ? `${slug}-preview` : slug;

  return `/images/${typeFolder}/${sizeFolder}/${filename}.${format}`;
}

export function imageExists(
  name: string,
  type: 'neighborhood' | 'city',
  size: 'square' | 'preview'
): boolean {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const typeKey = type === 'neighborhood' ? 'neighborhoods' : 'cities';

  const manifest = imageManifest as any;
  const entry = manifest[typeKey]?.[slug];

  if (!entry || !entry.hasCustomImage) return false;

  if (size === 'square') {
    return !!entry.square;
  } else {
    return !!entry.preview;
  }
}

export function getImageManifest() {
  return imageManifest;
}

export function getAllImages(type: 'neighborhood' | 'city') {
  const typeKey = type === 'neighborhood' ? 'neighborhoods' : 'cities';
  const manifest = imageManifest as any;
  return Object.keys(manifest[typeKey] || {});
}
```

#### 4.2 Create Initial Manifest

Create `src/data/imageManifest.json`:

```json
{
  "version": "1.0.0",
  "generated": "2025-10-21T00:00:00.000Z",
  "cities": {},
  "neighborhoods": {}
}
```

This will be overwritten by `generateImages.js` on first run.

### Success Criteria
- [ ] Utility functions compile without errors
- [ ] Manifest structure matches expected format
- [ ] Helper functions return correct paths

---

## Stage 5: Integration with NeighborhoodsPage

### Duration: 10 minutes

### Objectives
- Replace img tags with React components
- Test image loading
- Verify fallbacks work

### Tasks

#### 5.1 Update NeighborhoodsPage Imports

Add to top of `src/pages/NeighborhoodsPage.tsx`:

```tsx
import { LocationTile } from '../components/images/LocationTile';
import { LocationPreview } from '../components/images/LocationPreview';
```

#### 5.2 Replace Grid Tile Images

Find the grid rendering section (around line 267) and replace:

**Before:**
```tsx
<div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
  <img
    src={neighborhood.image}
    alt={neighborhood.name}
    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
    onError={(e) => {
      e.currentTarget.style.display = 'none';
    }}
  />
</div>
```

**After:**
```tsx
<LocationTile
  name={neighborhood.name}
  type={neighborhood.city === 'City' ? 'city' : 'neighborhood'}
  alt={`${neighborhood.name} ${neighborhood.city}`}
  onClick={() => handleNeighborhoodClick(neighborhood)}
  className="absolute inset-0"
/>
```

#### 5.3 Replace Preview Pane Image

Find the preview image (around line 190) and replace:

**Before:**
```tsx
<div className="h-[500px] bg-gray-900 relative overflow-hidden">
  <img
    src={hoveredNeighborhood.image}
    alt={hoveredNeighborhood.name}
    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
    onError={(e) => {
      e.currentTarget.style.display = 'none';
    }}
  />
  {/* ... */}
</div>
```

**After:**
```tsx
<div className="h-[500px] bg-gray-900 relative overflow-hidden">
  <LocationPreview
    name={hoveredNeighborhood.name}
    type={hoveredNeighborhood.city === 'City' ? 'city' : 'neighborhood'}
    alt={`${hoveredNeighborhood.name} preview`}
    className="absolute inset-0"
  />
  {/* Film grain overlay */}
  <div className="absolute inset-0 opacity-20 mix-blend-overlay film-grain" />
  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
  {/* ... */}
</div>
```

#### 5.4 Remove Old Image Path Logic

The old logic that built paths like `/images/neighborhoods/${hood.toLowerCase()}.jpg` can be removed since components handle this now.

### Success Criteria
- [ ] Page compiles without errors
- [ ] Images load correctly in grid
- [ ] Preview pane shows images
- [ ] Fallbacks work when images missing
- [ ] WebP loads on supported browsers

---

## Stage 6: Production & Optimization

### Duration: 15 minutes

### Objectives
- Add source images for all neighborhoods
- Generate production images
- Optimize build
- Test performance

### Tasks

#### 6.1 Add All Source Images

Option A: Manual upload
```bash
# Add images to:
public/images/neighborhoods/original/
public/images/cities/original/
```

Option B: Unsplash batch download
```bash
# Set API key
export UNSPLASH_ACCESS_KEY=your_key

# Fetch all missing images
npm run images:unsplash
```

#### 6.2 Generate Production Images

```bash
# Clean previous builds
npm run images:clean

# Generate all optimized images
npm run images:generate
```

**Verify output:**
```bash
ls public/images/neighborhoods/square/ | wc -l
# Should match number of neighborhoods × 2 (jpg + webp)

ls public/images/neighborhoods/preview/ | wc -l
# Should match number of neighborhoods × 2

cat src/data/imageManifest.json | grep hasCustomImage | wc -l
# Should match total neighborhoods + cities
```

#### 6.3 Test Build

```bash
npm run build
```

**Verify images in dist:**
```bash
ls dist/images/neighborhoods/square/
ls dist/images/cities/preview/
```

#### 6.4 Performance Testing

1. **Check WebP Support:**
```bash
# In browser console
document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0
# Should return true in modern browsers
```

2. **Check Image Sizes:**
```bash
du -sh public/images/neighborhoods/square/*
# Square JPG should be ~40-50KB
# Square WebP should be ~25-35KB

du -sh public/images/neighborhoods/preview/*
# Preview JPG should be ~150-200KB
# Preview WebP should be ~100-150KB
```

3. **Test Lazy Loading:**
- Open NeighborhoodsPage
- Open Network tab
- Scroll down slowly
- Images should load as they enter viewport

4. **Lighthouse Audit:**
```bash
npm run build
npm run preview
# Run Lighthouse on /neighborhoods
```

**Target metrics:**
- Performance: 90+
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.1

#### 6.5 Documentation Update

Create `.env.example`:
```bash
# Optional: Unsplash API for automatic image fetching
UNSPLASH_ACCESS_KEY=your_unsplash_api_key_here
```

Add to README:
```markdown
## Image System

This project uses an automated image processing system. See [docs/README_IMAGE_SYSTEM.md](./docs/README_IMAGE_SYSTEM.md) for details.

### Quick Start
```bash
# Add images
cp your-images/* public/images/neighborhoods/original/

# Process images
npm run images:generate

# Or watch for changes
npm run images:watch
```
```

### Success Criteria
- [ ] All neighborhoods have images
- [ ] Build completes successfully
- [ ] WebP images are smaller than JPG
- [ ] Lazy loading works
- [ ] Lighthouse score > 90
- [ ] Documentation updated

---

## Post-Implementation Checklist

### Functionality
- [ ] Images load in grid view
- [ ] Images load in preview pane
- [ ] WebP works in Chrome/Firefox/Edge
- [ ] JPG fallback works in Safari/older browsers
- [ ] Lazy loading reduces initial page load
- [ ] Missing images show gradient fallback
- [ ] Random tile works correctly

### Performance
- [ ] Square tiles < 50KB (WebP < 35KB)
- [ ] Previews < 200KB (WebP < 150KB)
- [ ] Page load < 3 seconds
- [ ] LCP < 2.5 seconds
- [ ] No layout shifts (CLS < 0.1)

### Developer Experience
- [ ] `npm run images:generate` works
- [ ] `npm run images:watch` detects changes
- [ ] Components are type-safe
- [ ] Easy to add new images
- [ ] Documentation is clear

### Production
- [ ] Build includes all images
- [ ] Manifest is up to date
- [ ] No broken image links
- [ ] CDN-ready (static assets)

---

## Maintenance

### Adding New Neighborhoods

1. Add image to `public/images/neighborhoods/original/new-hood.jpg`
2. Run `npm run images:generate`
3. Verify in manifest and test in browser

### Updating Existing Images

1. Replace image in `original/` folder
2. Run `npm run images:generate` (overwrites old versions)
3. Clear browser cache and test

### Changing Image Sizes

Edit `scripts/generateImages.js`:
```javascript
const CONFIG = {
  sizes: {
    square: { width: 300, height: 300 },  // Changed from 240
    preview: { width: 1000, height: 1200 }, // Changed from 840×1000
  },
};
```

Then regenerate:
```bash
npm run images:clean
npm run images:generate
```

### Troubleshooting

**Images not loading?**
- Check file naming (lowercase, hyphens)
- Verify manifest includes image
- Check browser console for 404s
- Run `npm run images:generate` again

**WebP not working?**
- Verify browser support
- Check that .webp files exist
- Confirm `<picture>` element rendering

**Sharp errors?**
```bash
npm rebuild sharp
```

---

## Next Steps

- Consider CDN for production (Cloudflare, AWS CloudFront)
- Add retina 2x versions (`@2x` suffixes)
- Implement progressive image loading (blur-up)
- Add image optimization CI/CD pipeline
- Monitor Core Web Vitals in production

---

**Questions?** See [Implementation Guide](./IMPLEMENTATION_GUIDE.md) or [Complete Documentation](./IMAGE_SYSTEM.md)
