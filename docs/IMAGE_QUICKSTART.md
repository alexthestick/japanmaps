# Quick Start - Image System (5 Minutes)

## Step 1: Install Dependencies (1 min)

```bash
npm install sharp chokidar node-fetch
```

## Step 2: Create Folders (30 seconds)

```bash
mkdir -p public/images/neighborhoods/original
mkdir -p public/images/neighborhoods/tiles
mkdir -p public/images/neighborhoods/previews
mkdir -p public/images/cities/original
mkdir -p public/images/cities/tiles
mkdir -p public/images/cities/previews
```

## Step 3: Add Your Images (2 min)

Drop your source images into the `original` folders:

```
public/images/neighborhoods/original/
  shibuya.jpg
  harajuku.jpg
  shinjuku.jpg
  ...

public/images/cities/original/
  tokyo.jpg
  osaka.jpg
  ...
```

**Naming rules:**
- Lowercase only
- Spaces → hyphens
- Examples: `shimokitazawa.jpg`, `minato-mirai.jpg`

## Step 4: Generate Images (30 seconds)

```bash
npm run images:generate
```

This creates:
- ✅ Tiles: 240×240px (for grid)
- ✅ Previews: 840×1000px (for detail view)
- ✅ WebP + JPG formats
- ✅ Image manifest JSON

## Step 5: Use in Your App (1 min)

**Option A: Use the helper components**

```tsx
import { LocationTile } from './components/images/LocationTile';
import { LocationPreview } from './components/images/LocationPreview';

// In your grid
<LocationTile
  name="shibuya"
  type="neighborhood"
  alt="Shibuya"
/>

// In your preview pane
<LocationPreview
  name="shibuya"
  type="neighborhood"
  alt="Shibuya neighborhood"
/>
```

**Option B: Use the OptimizedImage component**

```tsx
import { OptimizedImage } from './components/images/OptimizedImage';

<OptimizedImage
  src="/images/neighborhoods/tiles/shibuya.jpg"
  webp="/images/neighborhoods/tiles/shibuya.webp"
  alt="Shibuya"
  width={240}
  height={240}
  className="rounded-xl"
/>
```

## Bonus: Development Mode

Watch for image changes automatically:

```bash
npm run images:watch
```

Now whenever you drop a new image in `original/`, it automatically generates tiles + previews! 🎉

## Next Steps

- 📘 Read [Complete Documentation](./IMAGE_SYSTEM.md) for advanced features
- 🔧 Follow [Implementation Guide](./IMPLEMENTATION_GUIDE.md) to integrate fully
- 🏗️ Check [Architecture Diagram](./ARCHITECTURE_DIAGRAM.md) to understand the system

---

**That's it!** You now have a production-ready image system. 🚀
