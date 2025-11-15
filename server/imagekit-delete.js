/**
 * Local dev server handler for ImageKit deletes
 * Adapted from /api/imagekit-delete.js for Express
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
        error: 'Unauthorized. Please sign in to delete images.'
      });
    }

    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'fileId is required' });
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

    // Delete from ImageKit
    await imagekit.deleteFile(fileId);

    console.log(`✅ [Local Dev] Photo deleted for user: ${user.id}, fileId: ${fileId}`);

    return res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('❌ [Local Dev] Delete error:', error.message);

    // Check if error is "file not found"
    if (error.message?.includes('not found') || error.message?.includes('404')) {
      return res.status(404).json({
        error: 'Image not found',
        success: false
      });
    }

    return res.status(500).json({
      error: 'Failed to delete image. Please try again.',
      success: false
    });
  }
}
