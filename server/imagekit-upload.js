/**
 * Local dev server handler for ImageKit uploads
 * Adapted from /api/imagekit-upload.js for Express + multer
 */
import ImageKit from 'imagekit';
import { createClient } from '@supabase/supabase-js';

async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth verification failed:', error.message);
    return null;
  }
}

export default async function handler(req, res) {
  try {
    // Authentication check
    const user = await verifyAuth(req);

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized. Please sign in to upload images.'
      });
    }

    // Get uploaded file from multer
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type. Allowed: JPEG, PNG, WebP'
      });
    }

    // Parse metadata if provided
    let metadata = {};
    try {
      if (req.body.metadata) {
        metadata = JSON.parse(req.body.metadata);
      }
    } catch (e) {
      console.warn('Failed to parse metadata:', e);
    }

    // Initialize ImageKit
    const publicKey = process.env.VITE_IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.VITE_IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error('ImageKit credentials not configured');
    }

    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });

    // Generate filename
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname?.replace(/[^a-zA-Z0-9.-]/g, '_') || 'upload.jpg';
    const fileName = `${timestamp}_${sanitizedFilename}`;

    // Upload to ImageKit
    const uploadResult = await imagekit.upload({
      file: file.buffer, // multer stores file in memory as buffer
      fileName: fileName,
      folder: `/stores/${user.id}`,
      useUniqueFileName: true,
      tags: ['store', 'japan-maps', user.id],
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        originalName: metadata.originalName || file.originalname || 'unknown',
        originalSize: metadata.originalSize?.toString() || file.size.toString(),
        compressedSize: metadata.compressedSize?.toString() || file.size.toString(),
      },
    });

    console.log(`✅ [Local Dev] Photo uploaded for user: ${user.id}, fileId: ${uploadResult.fileId}`);

    // Return result matching UploadResult interface
    return res.status(200).json({
      url: uploadResult.url,
      fileId: uploadResult.fileId,
      thumbnailUrl: uploadResult.thumbnailUrl,
      width: uploadResult.width,
      height: uploadResult.height,
      size: uploadResult.size,
      format: uploadResult.fileType,
      provider: 'imagekit',
    });

  } catch (error) {
    console.error('❌ [Local Dev] Upload error:', error.message);

    return res.status(500).json({
      error: 'Failed to upload image. Please try again.',
      details: error.message,
    });
  }
}
