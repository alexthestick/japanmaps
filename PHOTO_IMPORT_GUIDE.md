# Photo Import System - Updated Guide

## Overview

The photo import system has been **completely rewritten** to use Vercel serverless functions instead of client-side fetching. This fixes all the authentication and CORS issues.

## Architecture

### Old (Broken) Flow:
```
Browser → Google Places API (CORS error ❌)
       → Client-side upload → ImageKit (auth required ❌)
```

### New (Working) Flow:
```
Browser → Vercel Serverless Function → Google Places API ✅
                                     → ImageKit upload ✅
        ← Returns ImageKit URLs
```

## Files Changed

1. **`/api/fetch-google-photos.js`** - NEW serverless function
   - Fetches photos from Google Places API (server-side, no CORS)
   - Uploads to ImageKit (server-side, no auth needed)
   - Returns array of ImageKit URLs

2. **`/src/utils/edgePhotoFetcher.ts`** - UPDATED
   - New function: `fetchGooglePhotosServerless()`
   - Updated: `migrateStorePhotosViaEdge()` to use serverless

3. **`/src/components/admin/BulkImportQueue.tsx`** - NO CHANGES NEEDED
   - Already uses `migrateStorePhotosViaEdge()`
   - Will automatically use new serverless flow

## How to Test

### Local Testing (Development)

The serverless function needs to run on Vercel (or use Vercel CLI locally).

**Option 1: Test on Vercel (Recommended)**
1. Deploy to Vercel: `vercel --prod` or push to GitHub
2. Use the admin bulk import queue
3. Watch the Vercel logs: `vercel logs`

**Option 2: Test with Vercel CLI Locally**
```bash
# Install Vercel CLI if not already
npm i -g vercel

# Run local dev server with serverless functions
vercel dev
```

Then open `http://localhost:3000` and use the bulk import queue.

### Testing Single Store Import

You can test the endpoint directly:

```bash
curl -X POST https://your-app.vercel.app/api/fetch-google-photos \
  -H "Content-Type: application/json" \
  -d '{
    "placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "storeId": "test-store-123",
    "maxPhotos": 5
  }'
```

Expected response:
```json
{
  "success": true,
  "urls": [
    "https://ik.imagekit.io/wscyshoygv/stores/imports/test-store-123/...",
    "https://ik.imagekit.io/wscyshoygv/stores/imports/test-store-123/...",
    ...
  ],
  "count": 5,
  "total": 10
}
```

## Environment Variables

Make sure these are set in **Vercel** (not just `.env.local`):

```
VITE_GOOGLE_PLACES_API_KEY=AIzaSy...
VITE_IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/wscyshoygv
```

**To set in Vercel:**
1. Go to your project settings
2. Environment Variables section
3. Add each variable
4. Redeploy

## Troubleshooting

### "Origin not allowed" error
- Make sure your Vercel deployment URL is in the `ALLOWED_ORIGINS` array in `/api/fetch-google-photos.js`
- Vercel preview deployments (`.vercel.app`) are automatically allowed

### "Google Places API error"
- Check that `VITE_GOOGLE_PLACES_API_KEY` is set in Vercel
- Verify the key has Places API enabled in Google Cloud Console

### "ImageKit credentials not configured"
- Check that all 3 ImageKit env vars are set in Vercel
- Make sure `IMAGEKIT_PRIVATE_KEY` is the private key (starts with `private_`)

### "Failed to fetch photos"
- Check Vercel function logs: `vercel logs --follow`
- Verify the placeId format (should be like `ChIJ...` or `places/ChIJ...`)

## Usage in Code

### Bulk Import Queue (Already works)
```tsx
import { migrateStorePhotosViaEdge } from '@/utils/edgePhotoFetcher';

const photoUrls = await migrateStorePhotosViaEdge(
  store.id,        // Store ID from database
  placeId,         // Google Place ID
  false            // dryRun = false
);

// photoUrls is now an array of ImageKit URLs
```

### Single Store Import (Future)
```tsx
import { fetchGooglePhotosServerless } from '@/utils/edgePhotoFetcher';

const photoUrls = await fetchGooglePhotosServerless(
  placeId,         // Google Place ID
  storeId,         // Store ID (or temporary ID before saving)
  5                // Max photos
);
```

## Rate Limiting

- **10 requests per minute** per IP address
- Automatic 1-second delay between photo uploads
- Google Places API has its own rate limits (check quota in GCP console)

## Next Steps

1. ✅ Photo fetcher working (current)
2. ⏳ Single store import endpoint (next)
3. ⏳ Update AddStoreForm.tsx to accept Google Maps URL
4. ⏳ Bulk import from CSV with new system

---

**Last Updated:** 2025-01-02
**Status:** ✅ COMPLETE - Ready for Production Testing

## What Was Changed

### ✅ Phase 1: Photo Fetcher (COMPLETE)
- Created `/api/fetch-google-photos.js` serverless function
- Updated `edgePhotoFetcher.ts` to use serverless endpoint
- BulkImportQueue now works without local dev server

### ✅ Phase 2: Single Store Import (COMPLETE)
- Created `/api/import-store.js` serverless function
- Created `importStore.ts` utility functions
- Updated `GoogleMapsStoreExtractor.tsx` to use serverless import
- Updated `AddStoreForm.tsx` to handle all extracted fields

## Files Modified

**New Files:**
- `/api/fetch-google-photos.js` - Serverless photo fetcher
- `/api/import-store.js` - Serverless store importer
- `/src/utils/importStore.ts` - Client-side import utilities

**Updated Files:**
- `/src/utils/edgePhotoFetcher.ts` - Now uses serverless endpoint
- `/src/components/admin/GoogleMapsStoreExtractor.tsx` - Uses new import system
- `/src/components/forms/AddStoreForm.tsx` - Handles all extracted fields

**No Changes Needed:**
- `/src/components/admin/BulkImportQueue.tsx` - Already compatible

## Next Steps (Future Enhancements)

1. Add progress indicator for photo uploads in UI
2. Add ability to manually select categories before applying
3. Support for bulk CSV import with Google Maps URLs
