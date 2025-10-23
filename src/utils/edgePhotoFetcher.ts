import { supabase } from '../lib/supabase';

export interface PhotoFetchResult {
  success: boolean;
  url?: string;
  fileName?: string;
  size?: number;
  error?: string;
  dryRun?: boolean;
}

/**
 * Fetch Google Photos using Supabase Edge Function
 * @param photoName - The photo name from Google Places API (e.g., "places/ChIJ.../photos/ATplDJa...")
 * @param storeId - Store ID for file naming
 * @param photoIndex - Index of the photo (0-based)
 * @param dryRun - If true, validates without uploading
 * @returns Photo fetch result with URL
 */
export async function fetchGooglePhotoViaEdge(
  photoName: string,
  storeId: string,
  photoIndex: number,
  dryRun: boolean = false
): Promise<PhotoFetchResult> {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-google-photo', {
      body: {
        photoName,
        storeId,
        photoIndex,
        dryRun,
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch photo',
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Unknown error',
      };
    }

    return {
      success: true,
      url: data.url,
      fileName: data.fileName,
      size: data.size,
      dryRun: data.dryRun,
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error occurred',
    };
  }
}

/**
 * Fetch multiple photos from Google Places API and upload to Supabase
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
 * Migrate existing store photos from Google to Supabase
 * @param storeId - Store ID
 * @param currentPhotos - Array of current photo URLs
 * @param placeId - Google Place ID
 * @param dryRun - If true, validates without uploading
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
    // Fetch place details to get photos
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'photos',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch place photos');
    }

    const data = await response.json();
    const photos = data.photos || [];

    if (photos.length === 0) {
      console.log('No photos found for this place');
      return [];
    }

    // Fetch photos via Edge Function
    return await fetchMultipleGooglePhotos(
      photos,
      storeId,
      5,
      dryRun,
      onProgress
    );
  } catch (error) {
    console.error('Error migrating photos:', error);
    throw error;
  }
}
