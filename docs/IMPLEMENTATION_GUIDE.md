# Implementation Guide - Step-by-Step Integration

## Overview

This guide walks you through integrating the Japan Maps Image System into your application from scratch to production.

## Stage 1: Setup & Installation (5 minutes)

### 1.1 Install Dependencies

```bash
npm install sharp chokidar node-fetch
```

**What this installs:**
- `sharp` - Fast image processing library
- `chokidar` - File system watcher for dev mode
- `node-fetch` - HTTP client for Unsplash API

### 1.2 Create Folder Structure

```bash
# Create all required directories
mkdir -p public/images/neighborhoods/original
mkdir -p public/images/neighborhoods/square
mkdir -p public/images/neighborhoods/preview
mkdir -p public/images/cities/original
mkdir -p public/images/cities/square
mkdir -p public/images/cities/preview
mkdir -p src/components/images
mkdir -p src/data
```

### 1.3 Verify Scripts

Check that `scripts/generateImages.js` exists. If not, create it from the template in IMAGE_SYSTEM.md.

## Stage 2: Add Source Images (10 minutes)

### 2.1 Image Requirements

- **Format:** JPG, PNG, or WebP
- **Minimum size:** 500px × 500px (larger recommended)
- **Quality:** High resolution for best results
- **Naming:** Lowercase, spaces as hyphens

### 2.2 Naming Convention

Match your image filenames to neighborhood/city slugs:

```
Shibuya → shibuya.jpg
Shimokitazawa → shimokitazawa.jpg
Minato Mirai → minato-mirai.jpg
```

### 2.3 Add Images

Place images in the appropriate `original/` folders:

```
public/images/neighborhoods/original/
  shibuya.jpg
  harajuku.jpg
  shinjuku.jpg
  ...

public/images/cities/original/
  tokyo.jpg
  osaka.jpg
  kyoto.jpg
  ...
```

## Stage 3: Generate Optimized Images (2 minutes)

### 3.1 Run Image Generator

```bash
npm run images:generate
```

**What this does:**
1. Scans `original/` folders
2. Generates 240×240 square versions
3. Generates 840×1000 preview versions
4. Creates WebP + JPG for each size
5. Updates `imageManifest.json`

### 3.2 Verify Output

Check that files were generated:

```bash
ls public/images/neighborhoods/square/
# Should see: shibuya.jpg, shibuya.webp, etc.

ls public/images/neighborhoods/preview/
# Should see: shibuya-preview.jpg, shibuya-preview.webp, etc.
```

### 3.3 Check Manifest

```bash
cat src/data/imageManifest.json
```

Should contain entries for all processed images.

## Stage 4: Create React Components (15 minutes)

### 4.1 Create OptimizedImage Component

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
}

export function OptimizedImage({
  src,
  webp,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
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
      />
    </picture>
  );
}
```

### 4.2 Create LocationTile Component

Create `src/components/images/LocationTile.tsx`:

```tsx
import { OptimizedImage } from './OptimizedImage';

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
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const basePath = `/images/${type === 'neighborhood' ? 'neighborhoods' : 'cities'}/square`;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer transition-transform hover:scale-105 ${className}`}
    >
      <OptimizedImage
        src={`${basePath}/${slug}.jpg`}
        webp={`${basePath}/${slug}.webp`}
        alt={alt}
        width={240}
        height={240}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
```

### 4.3 Create LocationPreview Component

Create `src/components/images/LocationPreview.tsx`:

```tsx
import { OptimizedImage } from './OptimizedImage';

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
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const basePath = `/images/${type === 'neighborhood' ? 'neighborhoods' : 'cities'}/preview`;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <OptimizedImage
        src={`${basePath}/${slug}-preview.jpg`}
        webp={`${basePath}/${slug}-preview.webp`}
        alt={alt}
        width={840}
        height={1000}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
```

## Stage 5: Create Utilities (10 minutes)

### 5.1 Create imageLoader Utility

Create `src/utils/imageLoader.ts`:

```typescript
import imageManifest from '../data/imageManifest.json';

export function getImagePath(
  name: string,
  type: 'neighborhood' | 'city',
  size: 'square' | 'preview'
): string {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const typeFolder = type === 'neighborhood' ? 'neighborhoods' : 'cities';
  const sizeFolder = size;
  const filename = size === 'preview' ? `${slug}-preview` : slug;

  return `/images/${typeFolder}/${sizeFolder}/${filename}.jpg`;
}

export function imageExists(
  name: string,
  type: 'neighborhood' | 'city',
  size: 'square' | 'preview'
): boolean {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const typeKey = type === 'neighborhood' ? 'neighborhoods' : 'cities';

  const manifest = imageManifest as any;
  return manifest[typeKey]?.[slug]?.hasCustomImage || false;
}

export function getImageManifest() {
  return imageManifest;
}
```

### 5.2 Create Initial Manifest Template

Create `src/data/imageManifest.json`:

```json
{
  "version": "1.0.0",
  "generated": "2025-10-21T00:00:00.000Z",
  "cities": {},
  "neighborhoods": {}
}
```

This will be auto-generated when you run `npm run images:generate`.

## Stage 6: Update NeighborhoodsPage (5 minutes)

### 6.1 Import Components

Update `src/pages/NeighborhoodsPage.tsx`:

```tsx
import { LocationTile } from '../components/images/LocationTile';
import { LocationPreview } from '../components/images/LocationPreview';
```

### 6.2 Replace Image Tags in Grid

Replace the button content with `LocationTile`:

```tsx
{neighborhoods.map((neighborhood) => (
  <LocationTile
    key={neighborhood.id}
    name={neighborhood.name}
    type={neighborhood.city === 'City' ? 'city' : 'neighborhood'}
    alt={`${neighborhood.name} ${neighborhood.city}`}
    onClick={() => handleNeighborhoodClick(neighborhood)}
    className={`rounded-xl transition-all duration-200 ${
      hoveredNeighborhood?.id === neighborhood.id
        ? 'ring-4 ring-cyan-400 shadow-2xl shadow-cyan-500/50 scale-110 z-10 -translate-y-2'
        : 'hover:scale-105 hover:shadow-xl hover:-translate-y-1'
    }`}
  />
))}
```

### 6.3 Replace Preview Image

Replace the preview pane image:

```tsx
{hoveredNeighborhood && (
  <LocationPreview
    name={hoveredNeighborhood.name}
    type={hoveredNeighborhood.city === 'City' ? 'city' : 'neighborhood'}
    alt={`${hoveredNeighborhood.name} preview`}
    className="h-[500px]"
  />
)}
```

## Stage 7: Add Package Scripts (2 minutes)

### 7.1 Update package.json

Add these scripts to your `package.json`:

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

## Stage 8: Development Workflow (Ongoing)

### 8.1 Start Watch Mode

In a separate terminal:

```bash
npm run images:watch
```

This will auto-process new images as you add them to `original/` folders.

### 8.2 Add New Images

1. Drop image in `public/images/neighborhoods/original/new-hood.jpg`
2. Watch mode automatically processes it
3. Manifest updates in real-time
4. Hot reload shows changes immediately

### 8.3 Manual Regeneration

If needed, manually regenerate all images:

```bash
npm run images:clean
npm run images:generate
```

## Stage 9: Optional Enhancements

### 9.1 Unsplash Integration

Set up environment variable:

```bash
# .env.local
UNSPLASH_ACCESS_KEY=your_api_key_here
```

Fetch missing images:

```bash
npm run images:unsplash
```

### 9.2 Add Error Handling

Add fallback images for missing neighborhoods:

```tsx
<img
  src={imagePath}
  alt={alt}
  onError={(e) => {
    e.currentTarget.src = '/images/fallback.jpg';
  }}
/>
```

## Stage 10: Production Build

### 10.1 Pre-Build Checklist

- [ ] All images processed (`npm run images:generate`)
- [ ] Manifest is up to date
- [ ] No broken image links
- [ ] WebP images generated

### 10.2 Build

```bash
npm run build
```

Images in `public/` are automatically included in `dist/`.

### 10.3 Verify Build

```bash
ls dist/images/neighborhoods/square/
# Should contain all processed images
```

## Troubleshooting

### Images not appearing?

1. Check file naming matches slug format
2. Run `npm run images:generate` manually
3. Verify manifest includes the image
4. Check browser console for 404 errors

### Sharp installation issues?

```bash
npm rebuild sharp
```

### Manifest not updating?

```bash
npm run images:clean
npm run images:generate
```

### Performance slow?

- Enable lazy loading (default)
- Ensure WebP generation is working
- Check image quality settings (85% recommended)

## Next Steps

- **Production Deployment**: See IMAGE_SYSTEM.md for CDN setup
- **Performance Optimization**: Check browser Network tab
- **Custom Sizes**: Modify CONFIG in generateImages.js
- **Batch Processing**: Use setup.sh for initial bulk processing

---

**Questions?** Check [Complete Documentation](./IMAGE_SYSTEM.md) or [Quick Start](./IMAGE_QUICKSTART.md)
