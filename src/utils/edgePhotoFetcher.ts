import { supabase } from '../lib/supabase';
import { uploadStorePhoto } from './upload';

export interface PhotoFetchResult {
  success: boolean;
  url?: string;
  fileName?: string;
  size?: number;
  error?: string;
  dryRun?: boolean;
}

/**
 * Fetch Google Photos via Vercel serverless function (no auth required)
 * This is a wrapper - the actual fetching happens server-side
 * @param placeId - Google Place ID
 * @param storeId - Store ID for file naming
 * @param maxPhotos - Maximum number of photos to fetch (default 5)
 * @returns Array of ImageKit URLs
 */
export async function fetchGooglePhotosServerless(
  placeId: string,
  storeId: string,
  maxPhotos: number = 5
): Promise<string[]> {
  try {
    console.log(`📸 Fetching photos via serverless function for place: ${placeId}`);

    const response = await fetch('/api/fetch-google-photos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        placeId,
        storeId,
        maxPhotos,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch photos');
    }

    console.log(`✅ Fetched ${result.count} photos successfully`);
    return result.urls || [];

  } catch (err) {
    console.error('❌ Error fetching photos:', err);
    throw err;
  }
}

/**
 * Fetch multiple photos from Google Places API and upload to ImageKit
 * @param photos - Array of photo objects from Google Places API
 * @param storeId - Store ID for file naming
 * @param maxPhotos - Maximum number of photos to fetch (default 5)
 * @param dryRun - If true, validates without uploading
 * @param onProgress - Callback for progress updates
 * @returns Array of uploaded photo URLs
 */
export async function fetchMultipleGooglePhotos(
  photos: Array<{ name: string }>,
  storeId: string,
  maxPhotos: number = 5,
  dryRun: boolean = false,
  onProgress?: (current: number, total: number, url?: string) => void
): Promise<string[]> {
  const photoUrls: string[] = [];
  const photosToFetch = photos.slice(0, maxPhotos);

  console.log(
    `${dryRun ? '[DRY RUN]' : ''} Fetching ${photosToFetch.length} photos for store ${storeId}`
  );

  for (let i = 0; i < photosToFetch.length; i++) {
    const photo = photosToFetch[i];

    // Progress callback
    if (onProgress) {
      onProgress(i + 1, photosToFetch.length);
    }

    try {
      const result = await fetchGooglePhotoViaEdge(
        photo.name,
        storeId,
        i,
        dryRun
      );

      if (result.success && result.url) {
        photoUrls.push(result.url);
        console.log(
          `✓ Photo ${i + 1}/${photosToFetch.length}: ${result.dryRun ? 'Validated (dry run)' : 'Uploaded'}`
        );

        if (onProgress) {
          onProgress(i + 1, photosToFetch.length, result.url);
        }
      } else {
        console.error(`✗ Photo ${i + 1}/${photosToFetch.length} failed:`, result.error);
      }

      // Delay between requests (2 seconds) to avoid rate limiting
      if (i < photosToFetch.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Error fetching photo ${i + 1}:`, error);
    }
  }

  console.log(
    `${dryRun ? '[DRY RUN]' : ''} Completed: ${photoUrls.length}/${photosToFetch.length} photos ${dryRun ? 'validated' : 'uploaded'}`
  );

  return photoUrls;
}

/**
 * Migrate store photos from Google Places to ImageKit (serverless)
 * @param storeId - Store ID
 * @param placeId - Google Place ID
 * @param dryRun - If true, validates without uploading (not implemented for serverless)
 * @param onProgress - Callback for progress updates
 * @returns New photo URLs
 */
export async function migrateStorePhotosViaEdge(
  storeId: string,
  placeId: string,
  dryRun: boolean = false,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  try {
    if (dryRun) {
      console.log('[DRY RUN] Would fetch photos for:', placeId);
      return [];
    }

    console.log(`📸 Migrating photos for store ${storeId} from place ${placeId}`);

    // Use the new serverless function
    const photoUrls = await fetchGooglePhotosServerless(placeId, storeId, 5);

    if (onProgress) {
      onProgress(photoUrls.length, photoUrls.length);
    }

    return photoUrls;
  } catch (error) {
    console.error('Error migrating photos:', error);
    throw error;
  }
}
