/**
 * MIGRATED TO IMAGEKIT - 2025-01-15
 *
 * Old Supabase storage code replaced with ImageKit
 * See: src/utils/imagekitUpload.ts for new implementation
 */
import { uploadStorePhoto as uploadToImageKit, deleteStorePhoto as deleteFromImageKit, type UploadResult } from './imagekitUpload';

/**
 * Upload store photo to ImageKit (migrated from Supabase)
 * @param file - Image file to upload
 * @returns Public URL of uploaded image or null on error
 */
export async function uploadStorePhoto(file: File): Promise<string | null> {
  try {
    const result: UploadResult = await uploadToImageKit(file);
    return result.url;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

/**
 * Upload store photo with full metadata (NEW - returns complete upload result)
 * @param file - Image file to upload
 * @returns Complete upload result with metadata
 */
export async function uploadStorePhotoWithMetadata(file: File): Promise<UploadResult | null> {
  try {
    return await uploadToImageKit(file);
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

/**
 * Delete store photo from ImageKit
 * @param urlOrFileId - Image URL or fileId
 * @returns Success status
 */
export async function deleteStorePhoto(urlOrFileId: string): Promise<boolean> {
  try {
    // Extract fileId from URL if full URL is provided
    let fileId = urlOrFileId;

    if (urlOrFileId.includes('imagekit.io')) {
      // Extract fileId from ImageKit URL
      const parts = urlOrFileId.split('/');
      fileId = parts[parts.length - 1].split('_')[0]; // Get fileId before underscore
    }

    return await deleteFromImageKit(fileId);
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

// Legacy Supabase code (DEPRECATED - kept for reference only)
/*
export async function uploadStorePhoto_OLD_SUPABASE(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('storage-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('storage-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}
*/


