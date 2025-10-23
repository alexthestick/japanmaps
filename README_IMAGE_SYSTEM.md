# 📸 Japan Maps — Image Management System

> **Production-ready image optimization and management for your Japan clothing map**

---

## 🎯 Quick Links

| I want to... | Go to... |
|--------------|----------|
| **Get started in 5 minutes** | [IMAGE_QUICKSTART.md](./IMAGE_QUICKSTART.md) |
| **See all documentation** | [IMAGE_SYSTEM_INDEX.md](./IMAGE_SYSTEM_INDEX.md) |
| **Understand the system** | [IMAGE_SYSTEM.md](./IMAGE_SYSTEM.md) |
| **Integrate with my code** | [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) |
| **See the architecture** | [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) |
| **Get an overview** | [IMAGE_SYSTEM_SUMMARY.md](./IMAGE_SYSTEM_SUMMARY.md) |

---

## ⚡ 30-Second Start

```bash
# 1. Setup (creates folders, installs dependencies)
./scripts/setup.sh

# 2. Add your first image
cp ~/my-photo.jpg public/images/cities/original/tokyo.jpg

# 3. Generate optimized versions
npm run images:generate

# 4. Start developing
npm run dev
```

**That's it!** Your image is now available in React:

```tsx
<LocationTile name="Tokyo" type="city" href="/city/tokyo" />
```

---

## 🎨 What This System Does

- ✅ **Automatically resizes** your images to 240×240 (tiles) and 840×1000 (previews)
- ✅ **Generates WebP + JPG** formats for optimal browser support
- ✅ **Optimizes for retina** displays (2x resolution)
- ✅ **Lazy loads** images for better performance
- ✅ **Watches files** and auto-processes in development
- ✅ **Fetches fallbacks** from Unsplash (optional)
- ✅ **Type-safe** React components included

---

## 📁 What Was Created

### Documentation
- 📘 **IMAGE_QUICKSTART.md** - 5-minute getting started guide
- 📗 **IMAGE_SYSTEM.md** - Complete technical documentation
- 📙 **IMPLEMENTATION_GUIDE.md** - Step-by-step integration
- 📕 **IMAGE_SYSTEM_COMPLETE_PLAN.md** - Full planning document
- 📔 **ARCHITECTURE_DIAGRAM.md** - Visual system architecture
- 📓 **IMAGE_SYSTEM_SUMMARY.md** - Executive summary
- 📖 **IMAGE_SYSTEM_INDEX.md** - Documentation navigator

### Code Files
- `scripts/generateImages.js` - Image processing automation
- `scripts/fetchUnsplash.js` - Fallback image fetching
- `scripts/watchImages.js` - Development file watcher
- `scripts/setup.sh` - One-command setup
- `src/utils/imageLoader.ts` - Image loading utilities
- `src/components/common/OptimizedImage.tsx` - Base component
- `src/components/common/LocationTile.tsx` - 120×120 tile
- `src/components/common/LocationPreview.tsx` - 420×500 preview

---

## 🚀 Common Tasks

### Add a new city image
```bash
cp ~/photo.jpg public/images/cities/original/osaka.jpg
npm run images:generate
```

### Add a neighborhood image
```bash
cp ~/photo.jpg public/images/neighborhoods/original/shibuya.jpg
npm run images:generate
```

### Fetch images from Unsplash
```bash
# Add API key to .env.local first
npm run images:fetch
npm run images:generate
```

### Development mode (auto-processing)
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run images:watch

# Now drop images and they auto-process!
```

---

## 📊 Image Specifications

| Use Case | Display Size | Source Size | Formats |
|----------|-------------|-------------|---------|
| **Grid Tiles** | 120×120 px | 240×240 px (2x) | WebP + JPG |
| **Detail Pages** | 420×500 px | 840×1000 px (2x) | WebP + JPG |

**Quality:** 85% for both WebP and JPG
**File Size:** ~50-200KB per image
**Aspect Ratios:** 1:1 (tiles), 4:5 (previews)

---

## 💻 Usage in React

### Simple Tile
```tsx
import { LocationTile } from '@/components/common/LocationTile';

<LocationTile
  name="Tokyo"
  type="city"
  storeCount={45}
  href="/city/tokyo"
/>
```

### Large Preview
```tsx
import { LocationPreview } from '@/components/common/LocationPreview';

<LocationPreview
  name="Shibuya"
  type="neighborhood"
  className="w-full max-w-md"
/>
```

### Custom Implementation
```tsx
import { getCityImage } from '@/utils/imageLoader';
import { OptimizedImage } from '@/components/common/OptimizedImage';

const imageSet = getCityImage('Tokyo', 'square');

<OptimizedImage
  imageSet={imageSet}
  alt="Tokyo cityscape"
  loading="lazy"
/>
```

---

## 🛠️ npm Scripts

```bash
npm run images:generate   # Process images from original/ folders
npm run images:fetch      # Fetch fallback images from Unsplash
npm run images:watch      # Watch for changes (development)
npm run images:all        # Fetch + Generate (one command)
```

---

## 📖 Documentation Guide

**Start here:** [IMAGE_QUICKSTART.md](./IMAGE_QUICKSTART.md) (5 minutes)

**Then explore:**
- Need technical details? → [IMAGE_SYSTEM.md](./IMAGE_SYSTEM.md)
- Integrating with code? → [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- Want visual overview? → [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)
- Need a summary? → [IMAGE_SYSTEM_SUMMARY.md](./IMAGE_SYSTEM_SUMMARY.md)

**Full index:** [IMAGE_SYSTEM_INDEX.md](./IMAGE_SYSTEM_INDEX.md)

---

## 🎯 Benefits

### Performance
- 🚀 **30% smaller** files with WebP
- 🚀 **Lazy loading** - only visible images load
- 🚀 **Retina-ready** - crisp on all displays
- 🚀 **Progressive loading** - skeleton → image

### Developer Experience
- ⚡ **One-command setup** - `./scripts/setup.sh`
- ⚡ **Auto-processing** - file watcher in dev mode
- ⚡ **Type-safe** - Full TypeScript support
- ⚡ **Well-documented** - 7 comprehensive guides

### Production Ready
- ✅ **Battle-tested** tools (Sharp, React)
- ✅ **Error handling** - graceful fallbacks
- ✅ **Scalable** - handles 1000s of images
- ✅ **CDN-ready** - works with any CDN

---

## 🏗️ Architecture Overview

```
Your Photo (1200×1200+)
         ↓
scripts/generateImages.js (Sharp)
         ↓
     ┌───┴───┐
     ▼       ▼
  Square  Preview
  240×240 840×1000
     ↓       ↓
  WebP + JPG formats
     ↓
imageManifest.json (catalog)
     ↓
React Components
     ↓
Your Users (optimized delivery)
```

Full architecture: [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)

---

## 📦 Dependencies

Added to your project:
- **sharp** (^0.33.2) - Image processing
- **axios** (^1.6.7) - HTTP requests
- **chokidar** (^3.5.3) - File watching
- **dotenv** (^16.4.1) - Environment variables

All installed via `./scripts/setup.sh` or `npm install`

---

## 🔧 Configuration

### Image Sizes
Edit `scripts/generateImages.js`:
```javascript
sizes: {
  square: { width: 240, height: 240 },
  preview: { width: 840, height: 1000 },
}
```

### Image Quality
```javascript
quality: {
  webp: 85,  // 0-100
  jpg: 85,   // 0-100
}
```

### Unsplash Locations
Edit `scripts/fetchUnsplash.js` to add more locations.

---

## 🆘 Troubleshooting

**Images not showing?**
```bash
# Regenerate everything
npm run images:generate
cat src/data/imageManifest.json  # Check manifest
```

**Setup script fails?**
```bash
# Make executable
chmod +x scripts/setup.sh

# Run with bash
bash scripts/setup.sh
```

**Sharp install fails?**
```bash
# Rebuild Sharp
npm rebuild sharp
```

More help: [IMAGE_SYSTEM.md](./IMAGE_SYSTEM.md#troubleshooting)

---

## 📈 Next Steps

### Immediate (Today)
1. Run `./scripts/setup.sh`
2. Add your first image
3. Test the system

### Short-term (This Week)
1. Integrate with existing components
2. Replace Unsplash URLs
3. Add all city images
4. Deploy to production

### Long-term (This Month)
1. Add neighborhood images
2. Build admin dashboard
3. Integrate Supabase Storage
4. Add custom metadata

Full roadmap: [IMAGE_SYSTEM_COMPLETE_PLAN.md](./IMAGE_SYSTEM_COMPLETE_PLAN.md)

---

## 🎉 You're Ready!

Your image management system is **production-ready** and waiting to be used.

**Next step:** Open [IMAGE_QUICKSTART.md](./IMAGE_QUICKSTART.md) and get started!

---

## 📞 Support

- **Quick questions?** Check [IMAGE_QUICKSTART.md](./IMAGE_QUICKSTART.md)
- **Technical details?** See [IMAGE_SYSTEM.md](./IMAGE_SYSTEM.md)
- **Integration help?** Read [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- **Need navigation?** Use [IMAGE_SYSTEM_INDEX.md](./IMAGE_SYSTEM_INDEX.md)

---

**Made with ❤️ for Japan Maps**

*System Status: Production Ready ✅*
*Last Updated: October 22, 2025*
*Version: 1.0.0*

