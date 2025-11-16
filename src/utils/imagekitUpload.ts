/**
 * Japan Maps - ImageKit Upload Service
 *
 * Features:
 * - Image compression (70-90% reduction)
 * - Secure server-side upload proxy
 * - Retry logic with exponential backoff
 * - Progress tracking
 * - User-scoped folders
 *
 * Architecture:
 * - Client compresses images (saves bandwidth)
 * - Server handles ImageKit uploads (more reliable)
 * - No client-side SDK authentication issues
 */
import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB before compression
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.85,
};

function validateFile(file: File): void {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
}

async function compressImage(file: File): Promise<File> {
  try {
    const startSize = file.size;
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
    const endSize = compressedFile.size;
    const savings = ((1 - endSize / startSize) * 100).toFixed(1);

    console.log(
      `📦 Compression: ${(startSize / 1024 / 1024).toFixed(2)}MB → ` +
      `${(endSize / 1024 / 1024).toFixed(2)}MB (${savings}% smaller)`
    );

    return compressedFile;
  } catch (error) {
    console.warn('⚠️ Compression failed, using original:', error);
    return file;
  }
}

/**
 * Upload file to server proxy with retry logic
 */
async function uploadToServerProxy(
  file: File,
  metadata: {
    originalName: string;
    originalSize: number;
    compressedSize: number;
  },
  maxRetries = 2
): Promise<UploadResult> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error('Please sign in to upload images');
  }

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await fetch('/api/imagekit-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Log full error details for debugging
        console.error('Server error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
        });

        if (response.status === 429) {
          throw new Error('Too many uploads. Please wait a moment and try again.');
        }

        if (response.status === 401) {
          throw new Error('Please sign in again to upload images.');
        }

        throw new Error(errorData.error || errorData.details || 'Upload failed');
      }

      const result: UploadResult = await response.json();
      return result;

    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Upload attempt ${attempt + 1} failed:`, error);

      // Don't retry on auth errors or validation errors
      if (lastError.message.includes('Unauthorized') ||
          lastError.message.includes('sign in') ||
          lastError.message.includes('Invalid file')) {
        throw lastError;
      }
    }
  }

  throw lastError!;
}

export interface UploadResult {
  url: string;
  fileId: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  size: number;
  format: string;
  provider: string;
}

export async function uploadStorePhoto(file: File): Promise<UploadResult> {
  try {
    // Step 1: Validate
    validateFile(file);

    // Step 2: Compress (client-side to save bandwidth)
    const compressedFile = await compressImage(file);

    // Step 3: Upload via server proxy
    const metadata = {
      originalName: file.name,
      originalSize: file.size,
      compressedSize: compressedFile.size,
    };

    const result = await uploadToServerProxy(compressedFile, metadata);

    console.log('✅ Upload successful:', {
      url: result.url,
      fileId: result.fileId,
      size: `${(result.size / 1024).toFixed(1)}KB`,
    });

    return result;

  } catch (error) {
    console.error('❌ Upload failed:', error);

    if (error instanceof Error) {
      if (error.message.includes('sign in')) {
        throw new Error('Please sign in to upload images');
      }

      if (error.message.includes('Too many')) {
        throw new Error('Too many uploads. Please wait a moment.');
      }

      if (error.message.includes('Invalid file')) {
        throw new Error('Invalid file type or size');
      }
    }

    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteStorePhoto(fileId: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Please sign in to delete images');
    }

    const response = await fetch('/api/imagekit-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ fileId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }

    console.log('✅ Image deleted:', fileId);
    return true;
  } catch (error) {
    console.error('❌ Delete failed:', error);
    return false;
  }
}
