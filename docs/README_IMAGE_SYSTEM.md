# Japan Maps - Image Management System

## 🎯 Quick Navigation

**Getting Started (5 minutes):**
👉 [Quick Start Guide](./IMAGE_QUICKSTART.md)

**Complete Documentation:**
- 📘 [Complete System Documentation](./IMAGE_SYSTEM.md) - Full technical reference
- 🔧 [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Step-by-step integration
- 🏗️ [Architecture Diagram](./ARCHITECTURE_DIAGRAM.md) - Visual system overview
- 📋 [Complete Plan](./IMAGE_SYSTEM_COMPLETE_PLAN.md) - All 6 stages detailed
- 📊 [Executive Summary](./IMAGE_SYSTEM_SUMMARY.md) - High-level overview
- 🗂️ [Documentation Index](./IMAGE_SYSTEM_INDEX.md) - Full documentation navigator

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create folder structure
mkdir -p public/images/neighborhoods/original
mkdir -p public/images/cities/original

# 3. Drop your images into original folders
# (shibuya.jpg, harajuku.jpg, etc.)

# 4. Generate optimized images
npm run images:generate

# 5. Start dev server with auto-processing
npm run images:watch
```

## ✨ What This System Does

- ✅ **Automatically resizes** neighborhood/city images to optimal dimensions
- ✅ **Generates WebP + JPG** formats for modern and legacy browsers
- ✅ **Creates retina versions** (2x resolution) for high-DPI displays
- ✅ **Builds image manifest** with metadata for easy loading
- ✅ **Watches for changes** in development mode
- ✅ **Provides React components** ready to drop into your app
- ✅ **Fetches from Unsplash** as fallback (optional)

## 📂 Folder Structure

```
public/images/
  neighborhoods/
    original/        ← Drop source images here
      shibuya.jpg
      harajuku.jpg
    tiles/           ← Auto-generated 240×240 tiles
    previews/        ← Auto-generated 840×1000 previews
  cities/
    original/        ← Drop source images here
    tiles/
    previews/
```

## 🎨 Image Requirements

- **Format:** JPG, PNG, or WebP
- **Minimum size:** 500px × 500px (larger is better)
- **Naming:** lowercase, spaces as hyphens
  - Example: `Shimokitazawa` → `shimokitazawa.jpg`

## 🛠️ Available Commands

```bash
npm run images:generate  # Process all images once
npm run images:watch     # Watch for changes in dev mode
npm run images:unsplash  # Fetch missing images from Unsplash
npm run images:clean     # Remove generated files
```

## 📖 Next Steps

1. **New to the system?** → Read [Quick Start Guide](./IMAGE_QUICKSTART.md)
2. **Ready to integrate?** → Follow [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
3. **Want technical details?** → Check [Complete Documentation](./IMAGE_SYSTEM.md)
4. **Need architecture overview?** → See [Architecture Diagram](./ARCHITECTURE_DIAGRAM.md)

---

**Created:** 2025-10-21
**Version:** 1.0
**Maintained by:** Lost in Transit Team
