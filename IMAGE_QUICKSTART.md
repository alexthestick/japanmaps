# 🚀 Image System Quick Start

Get up and running with the Japan Maps image system in 5 minutes!

## One-Command Setup

```bash
# Run the setup script
./scripts/setup.sh

# Or if that doesn't work:
bash scripts/setup.sh
```

This will:
- ✅ Create all necessary folders
- ✅ Install dependencies (Sharp, Axios, Chokidar)
- ✅ Create .env.local template
- ✅ Set up the complete system

## Quick Test (2 minutes)

### Option A: Test with Unsplash (requires API key)

```bash
# 1. Add your Unsplash key to .env.local
echo "VITE_UNSPLASH_ACCESS_KEY=your_key_here" >> .env.local

# 2. Fetch sample images
npm run images:fetch

# 3. Generate optimized versions
npm run images:generate

# 4. Start dev server
npm run dev
```

### Option B: Test with your own photo

```bash
# 1. Copy a photo
cp ~/my-photo.jpg public/images/cities/original/tokyo.jpg

# 2. Generate optimized versions
npm run images:generate

# 3. Check the output
ls public/images/cities/square/
ls public/images/cities/preview/

# 4. Start dev server
npm run dev
```

## Verify It Works

Open your browser console and check:

```javascript
// In browser console:
import manifest from './src/data/imageManifest.json';
console.log(manifest); // Should show your images
```

Or just look for images in:
- `/images/cities/square/` - 240×240 tiles
- `/images/cities/preview/` - 840×1000 previews

## Basic Usage in React

```tsx
import { LocationTile } from '@/components/common/LocationTile';

function MyComponent() {
  return (
    <LocationTile
      name="Tokyo"
      type="city"
      storeCount={45}
      href="/city/tokyo"
    />
  );
}
```

## Development Workflow

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Watch for new images
npm run images:watch

# Now drop images into public/images/cities/original/
# They'll auto-process!
```

## Available Commands

```bash
npm run images:generate   # Process originals → optimized
npm run images:fetch      # Download from Unsplash
npm run images:watch      # Watch for changes
npm run images:all        # Fetch + Generate
```

## File Structure

```
your-project/
├── public/images/
│   ├── cities/
│   │   ├── original/    👈 Drop photos here
│   │   ├── square/      ✨ Auto-generated
│   │   └── preview/     ✨ Auto-generated
│   └── neighborhoods/
│       └── ...
├── src/
│   ├── data/
│   │   └── imageManifest.json  ✨ Auto-generated
│   ├── utils/
│   │   └── imageLoader.ts
│   └── components/common/
│       ├── OptimizedImage.tsx
│       ├── LocationTile.tsx
│       └── LocationPreview.tsx
└── scripts/
    ├── generateImages.js
    ├── fetchUnsplash.js
    └── watchImages.js
```

## Troubleshooting

**"Command not found"?**
```bash
# Make script executable
chmod +x scripts/setup.sh
```

**"No images showing up"?**
```bash
# Check manifest was created
cat src/data/imageManifest.json

# Regenerate images
npm run images:generate
```

**"Sharp install failed"?**
```bash
# Rebuild Sharp
npm rebuild sharp
```

## Next Steps

1. ✅ Read full docs: [IMAGE_SYSTEM.md](./IMAGE_SYSTEM.md)
2. ✅ Integration guide: [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
3. ✅ Complete plan: [IMAGE_SYSTEM_COMPLETE_PLAN.md](./IMAGE_SYSTEM_COMPLETE_PLAN.md)

---

**Need help?** Check the documentation or your browser console for errors.

**Ready to deploy?** Run `npm run build` and all images will be included!

