# 📸 Japan Maps Image Management System

Complete guide for managing city and neighborhood images in your Japan Maps application.

## 🎯 Overview

This system provides:
- ✅ Automatic image resizing and optimization
- ✅ WebP + JPG fallback support
- ✅ Retina display support (2x resolution)
- ✅ Lazy loading and performance optimization
- ✅ Unsplash fallback for missing images
- ✅ Development file watcher

## 📐 Image Specifications

### Neighborhood/City Tiles (Grid View)
- **Display size:** 120 × 120 px
- **Source size:** 240 × 240 px (2x for retina)
- **Aspect ratio:** 1:1 square
- **Format:** WebP + JPG fallback

### Preview Pane (Detail Pages)
- **Display size:** ~420 × 500 px
- **Source size:** 840 × 1000 px (2x for retina)
- **Aspect ratio:** 4:5 portrait
- **Format:** WebP + JPG fallback

## 🗂️ Folder Structure

```
public/images/
├── cities/
│   ├── original/          # Drop your high-res photos here (min 1200×1200)
│   ├── square/            # Auto-generated 240×240
│   └── preview/           # Auto-generated 840×1000
├── neighborhoods/
│   ├── original/          # Drop your high-res photos here
│   ├── square/            # Auto-generated 240×240
│   └── preview/           # Auto-generated 840×1000
└── fallbacks/             # Default images for missing locations
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `sharp` - Image processing
- `axios` - HTTP requests (Unsplash)
- `chokidar` - File watching
- `dotenv` - Environment variables

### 2. Set Up Unsplash API (Optional)

If you want to automatically fetch fallback images from Unsplash:

1. Get a free API key at: https://unsplash.com/developers
2. Add to your `.env.local`:

```bash
VITE_UNSPLASH_ACCESS_KEY=your_key_here
```

### 3. Add Your First Images

**Option A: Manual Upload**
```bash
# 1. Drop your high-res image(s) into:
public/images/cities/original/tokyo.jpg
public/images/neighborhoods/original/shibuya.jpg

# 2. Generate optimized versions:
npm run images:generate
```

**Option B: Fetch from Unsplash**
```bash
# Automatically download images for all locations:
npm run images:fetch

# Then generate optimized versions:
npm run images:generate

# Or do both at once:
npm run images:all
```

## 📝 Available Commands

```bash
# Generate optimized images from originals
npm run images:generate

# Fetch fallback images from Unsplash
npm run images:fetch

# Watch for changes and auto-process
npm run images:watch

# Fetch + Generate in one command
npm run images:all
```

## 🔄 Development Workflow

### Automatic Processing (Recommended)

Start the image watcher alongside your dev server:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run images:watch
```

Now just drop images into `public/images/cities/original/` or `public/images/neighborhoods/original/` and they'll be automatically processed!

### Manual Processing

```bash
# 1. Add your images to original folders
cp ~/my-photo.jpg public/images/cities/original/tokyo.jpg

# 2. Generate optimized versions
npm run images:generate

# 3. Done! The manifest is updated automatically
```

## 🎨 Using Images in React

### City/Neighborhood Tiles (120×120)

```tsx
import { LocationTile } from '@/components/common/LocationTile';

function CityGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <LocationTile
        name="Tokyo"
        type="city"
        storeCount={45}
        href="/city/tokyo"
      />
      <LocationTile
        name="Shibuya"
        type="neighborhood"
        storeCount={12}
        href="/neighborhood/shibuya"
      />
    </div>
  );
}
```

### Preview Images (420×500)

```tsx
import { LocationPreview } from '@/components/common/LocationPreview';

function CityPage() {
  return (
    <div>
      <LocationPreview
        name="Tokyo"
        type="city"
        className="w-full max-w-md"
      />
    </div>
  );
}
```

### Low-Level Image Loading

```tsx
import { getCityImage, getNeighborhoodImage } from '@/utils/imageLoader';
import { OptimizedImage } from '@/components/common/OptimizedImage';

function CustomComponent() {
  const tokyoSquare = getCityImage('Tokyo', 'square');
  const shibuyaPreview = getNeighborhoodImage('Shibuya', 'preview');

  return (
    <div>
      {tokyoSquare && (
        <OptimizedImage
          imageSet={tokyoSquare}
          alt="Tokyo cityscape"
          loading="lazy"
        />
      )}
    </div>
  );
}
```

## 📊 Image Manifest

The system auto-generates `src/data/imageManifest.json`:

```json
{
  "version": "1.0.0",
  "generated": "2025-10-22T10:30:00Z",
  "cities": {
    "tokyo": {
      "slug": "tokyo",
      "hasCustomImage": true,
      "square": {
        "webp": "/images/cities/square/tokyo.webp",
        "jpg": "/images/cities/square/tokyo.jpg",
        "width": 240,
        "height": 240
      },
      "preview": {
        "webp": "/images/cities/preview/tokyo-preview.webp",
        "jpg": "/images/cities/preview/tokyo-preview.jpg",
        "width": 840,
        "height": 1000
      }
    }
  }
}
```

## 🎯 Best Practices

### Image Quality
- **Minimum resolution:** 1200×1200 for originals
- **Format:** JPG or PNG for originals
- **Naming:** Use lowercase slugs (`tokyo.jpg`, `shibuya.jpg`)

### File Size
- Originals: < 5MB (will be optimized)
- Generated files: ~50-200KB each

### Naming Conventions
```
✅ Good:
  tokyo.jpg
  shimokitazawa.jpg
  kanagawa-yokohama.jpg  (for "Kanagawa / Yokohama")

❌ Bad:
  Tokyo.JPG
  Shimo Kitazawa.png
  IMG_1234.jpg
```

## 🔧 Advanced Configuration

### Customize Image Sizes

Edit `scripts/generateImages.js`:

```javascript
const CONFIG = {
  sizes: {
    square: { width: 240, height: 240 },      // Change here
    preview: { width: 840, height: 1000 },    // And here
  },
  quality: {
    webp: 85,  // 0-100
    jpg: 85,   // 0-100
  },
};
```

### Add More Locations

Edit `scripts/fetchUnsplash.js`:

```javascript
const LOCATIONS = {
  neighborhoods: [
    { name: 'Ginza', city: 'Tokyo', query: 'ginza tokyo luxury' },
    // Add more here
  ],
};
```

## 🚨 Troubleshooting

### Images not showing up?
```bash
# 1. Check the manifest was generated
cat src/data/imageManifest.json

# 2. Verify files exist
ls public/images/cities/square/
ls public/images/cities/preview/

# 3. Regenerate everything
npm run images:generate
```

### WebP not working?
Modern browsers support WebP, but the system auto-falls back to JPG. Check browser console for errors.

### Unsplash API errors?
```bash
# Check your API key
echo $VITE_UNSPLASH_ACCESS_KEY

# Or check .env.local file
cat .env.local
```

## 🎁 Future Enhancements

Possible additions:
- ✨ Supabase Storage integration for user uploads
- ✨ Admin dashboard for image management
- ✨ Image cropping UI
- ✨ Dark mode variants
- ✨ Photographer credits display
- ✨ AVIF format support

## 📚 Technical Details

### Why Sharp?
- Fast (native C bindings)
- Excellent quality
- Supports WebP, AVIF, and all common formats
- Works on all platforms (Mac, Linux, Windows)

### Why Both WebP and JPG?
- WebP: 25-35% smaller, supported by 95%+ of browsers
- JPG: Universal fallback for older browsers
- React automatically picks the best format

### Performance
- Lazy loading prevents loading all images at once
- 2x resolution ensures crisp display on retina screens
- WebP saves ~30% bandwidth vs JPG

## 🆘 Support

Issues? Check:
1. Node.js version (>= 18 required)
2. File permissions on `public/images/` directories
3. Run `npm install` to ensure all dependencies are installed

---

**Made with ❤️ for Japan Maps**

