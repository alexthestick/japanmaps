# 🎯 Implementation Guide — Integrating Image System

Step-by-step guide to integrate the new image system into your existing Japan Maps codebase.

## Phase 1: Setup (15 minutes)

### Step 1: Install Dependencies

```bash
cd "/Users/alexcoluna/Desktop/Project Folder/Japan Maps"
npm install sharp axios chokidar dotenv --save-dev
```

### Step 2: Create Directory Structure

```bash
# Create all needed directories
mkdir -p public/images/cities/{original,square,preview}
mkdir -p public/images/neighborhoods/{original,square,preview}
mkdir -p public/images/fallbacks
```

### Step 3: Optional - Set Up Unsplash

If you want auto-fetch capability:

```bash
# Add to .env.local (create if doesn't exist)
echo "VITE_UNSPLASH_ACCESS_KEY=your_key_here" >> .env.local
```

Get your key: https://unsplash.com/developers

## Phase 2: Update Existing Code (30 minutes)

### Update cityData.ts

Replace the hardcoded Unsplash URLs with your new image system:

```typescript
// src/utils/cityData.ts
import { supabase } from '../lib/supabase';
import { getCityImage } from './imageLoader';

export interface CityData {
  name: string;
  storeCount: number;
  image: string;
}

// Remove old CITY_IMAGES constant
// Keep MAJOR_JAPAN_CITIES as is

/**
 * Fetch actual store counts per city from Supabase (Japan cities only)
 */
export async function getCityDataWithCounts(): Promise<CityData[]> {
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('city, country')
      .eq('country', 'Japan');

    if (error) {
      console.error('Error fetching city counts:', error);
      return getDefaultCityData();
    }

    if (!stores) {
      return getDefaultCityData();
    }

    const cityCounts = stores.reduce((acc, store) => {
      const city = store.city;
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Build city data with new image system
    const cityData: CityData[] = MAJOR_JAPAN_CITIES
      .map((name) => {
        const imageSet = getCityImage(name, 'square');
        const imageUrl = imageSet?.webp || imageSet?.jpg || '';

        return {
          name,
          storeCount: cityCounts[name] || 0,
          image: imageUrl,
        };
      })
      .sort((a, b) => b.storeCount - a.storeCount);

    return cityData;
  } catch (err) {
    console.error('Error in getCityDataWithCounts:', err);
    return getDefaultCityData();
  }
}

function getDefaultCityData(): CityData[] {
  return MAJOR_JAPAN_CITIES.map((name) => {
    const imageSet = getCityImage(name, 'square');
    return {
      name,
      storeCount: 0,
      image: imageSet?.webp || imageSet?.jpg || '',
    };
  });
}

// Keep cityToSlug and slugToCity as is
```

### Update CitiesCarousel Component

Replace with optimized images:

```typescript
// src/components/landing/CitiesCarousel.tsx
import { LocationTile } from '../common/LocationTile';
import { cityToSlug } from '../../utils/cityData';

// ... keep existing imports and interface

export function CitiesCarousel({ cities }: CitiesCarouselProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cities.map((city) => (
        <LocationTile
          key={city.name}
          name={city.name}
          type="city"
          storeCount={city.storeCount}
          href={`/city/${cityToSlug(city.name)}`}
        />
      ))}
    </div>
  );
}
```

### Update CityPage Component

Add preview image to city detail pages:

```typescript
// src/pages/CityPage.tsx
import { LocationPreview } from '../components/common/LocationPreview';

// In your component:
<div className="container mx-auto px-4 py-8">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Preview Image */}
    <div className="lg:col-span-1">
      <LocationPreview
        name={cityName}
        type="city"
        className="sticky top-20"
      />
    </div>

    {/* Store List */}
    <div className="lg:col-span-2">
      {/* Your existing store list code */}
    </div>
  </div>
</div>
```

## Phase 3: Generate Initial Images (20 minutes)

### Option A: Use Your Own Photos

```bash
# 1. Copy your photos to the original folders
cp ~/my-tokyo-photo.jpg public/images/cities/original/tokyo.jpg
cp ~/my-osaka-photo.jpg public/images/cities/original/osaka.jpg

# 2. Generate optimized versions
npm run images:generate
```

### Option B: Fetch from Unsplash

```bash
# Fetch all images (requires API key)
npm run images:fetch

# Generate optimized versions
npm run images:generate
```

### Option C: Hybrid Approach

```bash
# 1. Add your custom photos for key cities
cp ~/photos/*.jpg public/images/cities/original/

# 2. Generate from your photos
npm run images:generate

# 3. Fetch Unsplash for remaining cities
npm run images:fetch

# 4. Generate the Unsplash downloads
npm run images:generate
```

## Phase 4: Development Setup (5 minutes)

### Start the Image Watcher

Run this alongside your dev server:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run images:watch
```

Now you can drop new images into the `original/` folders and they'll auto-process!

## Phase 5: Migration Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Create directory structure
- [ ] Update `cityData.ts` to use `imageLoader`
- [ ] Update `CitiesCarousel` to use `LocationTile`
- [ ] Update `CityPage` to use `LocationPreview`
- [ ] Generate initial images
- [ ] Test in development
- [ ] Verify WebP support in browser
- [ ] Check mobile responsiveness
- [ ] Build for production (`npm run build`)
- [ ] Deploy!

## Testing Checklist

```bash
# ✅ Test image generation
npm run images:generate

# ✅ Check manifest was created
cat src/data/imageManifest.json

# ✅ Verify files exist
ls public/images/cities/square/
ls public/images/cities/preview/

# ✅ Test in browser
npm run dev
# Open http://localhost:5173
# Check Network tab for WebP requests
# Verify lazy loading works
```

## Performance Validation

After implementation, check:

1. **Image Sizes**
   - Square tiles: ~50-100KB each
   - Preview images: ~100-200KB each

2. **Loading Performance**
   - Tiles should load progressively (lazy)
   - Preview images should load immediately (eager)

3. **Format Support**
   - Modern browsers get WebP
   - Older browsers get JPG
   - Check in Network tab

4. **Visual Quality**
   - Images should look crisp on retina displays
   - No pixelation or blurriness
   - Proper aspect ratios maintained

## Rollback Plan

If something goes wrong:

```bash
# 1. Revert code changes
git checkout src/utils/cityData.ts
git checkout src/components/landing/CitiesCarousel.tsx

# 2. Remove new files
rm -rf src/components/common/OptimizedImage.tsx
rm -rf src/components/common/LocationTile.tsx
rm -rf src/components/common/LocationPreview.tsx
rm -rf src/utils/imageLoader.ts

# 3. Keep the original Unsplash URLs working
# (Your old code still has them hardcoded)
```

## Production Deployment

### Build Step

```bash
# 1. Ensure all images are generated
npm run images:generate

# 2. Build the project
npm run build

# 3. Verify manifest is included
ls dist/src/data/imageManifest.json

# 4. Verify images are copied
ls dist/images/cities/square/
```

### Vercel/Netlify Configuration

Your `public/images/` folder will be automatically deployed. No special configuration needed!

### Performance Budget

Set these budgets in your build:
- Max image size: 200KB per image
- Total images per page: < 2MB
- Lazy loading: Enabled by default

## Next Steps

After successful implementation:

1. **Add More Locations**
   - Add more neighborhoods to `scripts/fetchUnsplash.js`
   - Generate images for them

2. **Custom Photography**
   - Replace Unsplash images with your own photos
   - Just drop them in `original/` folders

3. **Metadata Enhancement**
   - Add photographer credits
   - Add alt text for accessibility
   - Add location tags

4. **Admin Dashboard**
   - Build UI for uploading images
   - Integrate with Supabase Storage
   - Auto-process on upload

## FAQ

**Q: Do I need to regenerate images every time I add one?**
A: No! Use `npm run images:watch` in development. It auto-processes new images.

**Q: Can I mix my own photos with Unsplash?**
A: Yes! Your own photos take priority. Unsplash is just for fallbacks.

**Q: What if I want different image sizes?**
A: Edit `scripts/generateImages.js` and change the `CONFIG.sizes` object.

**Q: How do I add more cities?**
A: Add them to `MAJOR_JAPAN_CITIES` in `cityData.ts` and `LOCATIONS` in `fetchUnsplash.js`.

**Q: Do images work offline?**
A: Once loaded, images are cached by the browser. Use a service worker for full offline support.

## Support

Need help? Check:
- `IMAGE_SYSTEM.md` - Full system documentation
- Browser console for errors
- Network tab for failed image requests
- Generated manifest: `src/data/imageManifest.json`

---

Happy mapping! 🗾✨

