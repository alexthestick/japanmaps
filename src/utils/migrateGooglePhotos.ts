import { supabase } from '../lib/supabase';

/**
 * Download a Google photo and upload to Supabase Storage
 * This fixes expired/broken Google photo URLs
 */
export async function migrateGooglePhotoToSupabase(
  googlePhotoUrl: string,
  storeId: string,
  photoIndex: number
): Promise<string | null> {
  try {
    // Fetch the image from Google
    const response = await fetch(googlePhotoUrl);
    if (!response.ok) {
      console.error(`Failed to fetch photo: ${response.statusText}`);
      return null;
    }

    const blob = await response.blob();

    // Generate filename
    const fileExt = blob.type.split('/')[1] || 'jpg';
    const fileName = `${storeId}-${photoIndex}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`; // Just the filename, no subfolder

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('storage-photos') // Changed to match your bucket name
      .upload(filePath, blob, {
        contentType: blob.type,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('storage-photos') // Changed to match your bucket name
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Migration error:', error);
    return null;
  }
}

/**
 * Migrate all Google photos for a store to Supabase
 */
export async function migrateStorePhotos(storeId: string, googlePhotoUrls: string[]): Promise<string[]> {
  const newUrls: string[] = [];

  for (let i = 0; i < googlePhotoUrls.length; i++) {
    const url = googlePhotoUrls[i];

    // Skip if already a Supabase URL
    if (url.includes('supabase')) {
      newUrls.push(url);
      continue;
    }

    // Skip if not a Google URL
    if (!url.includes('google')) {
      newUrls.push(url);
      continue;
    }

    console.log(`Migrating photo ${i + 1}/${googlePhotoUrls.length}...`);
    const newUrl = await migrateGooglePhotoToSupabase(url, storeId, i);

    if (newUrl) {
      newUrls.push(newUrl);
    } else {
      // Keep original if migration fails
      newUrls.push(url);
    }

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return newUrls;
}
