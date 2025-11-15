/**
 * Japan Maps - ImageKit Upload Proxy (Server-Side)
 *
 * This endpoint handles photo uploads to ImageKit via server-side proxy.
 * Benefits:
 * - More reliable than client-side SDK
 * - No authenticator callback issues
 * - Better error handling
 * - Secure authentication
 *
 * Flow:
 * 1. Client compresses image
 * 2. Client sends to this endpoint with auth token
 * 3. Server verifies user authentication
 * 4. Server uploads to ImageKit using Node SDK
 * 5. Returns ImageKit URL to client
 */
import ImageKit from 'imagekit';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // More lenient for uploads

// Allowed origins
const PRODUCTION_DOMAIN = process.env.PRODUCTION_URL || 'https://japanmaps.vercel.app';
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://japanmaps.vercel.app',
  PRODUCTION_DOMAIN,
];

function isOriginAllowed(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
}

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  const validRequests = userRequests.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );
  if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  return true;
}

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

function setCorsHeaders(res, origin) {
  const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// Disable body parser for multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const origin = req.headers.origin;

  if (origin && !isOriginAllowed(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  if (req.method === 'OPTIONS') {
    setCorsHeaders(res, origin);
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  setCorsHeaders(res, origin);

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
             req.headers['x-real-ip'] ||
             'unknown';

  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: 'Too many upload requests. Please try again later.',
      retryAfter: 60
    });
  }

  // Authentication check
  const user = await verifyAuth(req);

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized. Please sign in to upload images.'
    });
  }

  try {
    // Parse multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB max
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Get uploaded file
    const file = files.file?.[0] || files.file;

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
      if (fields.metadata) {
        const metadataStr = Array.isArray(fields.metadata)
          ? fields.metadata[0]
          : fields.metadata;
        metadata = JSON.parse(metadataStr);
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

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);

    // Generate filename
    const timestamp = Date.now();
    const sanitizedFilename = file.originalFilename?.replace(/[^a-zA-Z0-9.-]/g, '_') || 'upload.jpg';
    const fileName = `${timestamp}_${sanitizedFilename}`;

    // Upload to ImageKit
    const uploadResult = await imagekit.upload({
      file: fileBuffer,
      fileName: fileName,
      folder: `/stores/${user.id}`,
      useUniqueFileName: true,
      tags: ['store', 'japan-maps', user.id],
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        originalName: metadata.originalName || file.originalFilename || 'unknown',
        originalSize: metadata.originalSize?.toString() || file.size.toString(),
        compressedSize: metadata.compressedSize?.toString() || file.size.toString(),
      },
    });

    // Clean up temp file
    try {
      fs.unlinkSync(file.filepath);
    } catch (e) {
      console.warn('Failed to delete temp file:', e);
    }

    console.log(`✅ [Japan Maps] Photo uploaded for user: ${user.id}, fileId: ${uploadResult.fileId}`);

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
    console.error('❌ [Japan Maps] Upload error:', {
      message: error.message,
      userId: user?.id,
      timestamp: new Date().toISOString(),
    });

    // Clean up temp file on error
    try {
      if (files?.file) {
        const file = files.file?.[0] || files.file;
        if (file?.filepath) {
          fs.unlinkSync(file.filepath);
        }
      }
    } catch (e) {
      // Ignore cleanup errors
    }

    return res.status(500).json({
      error: 'Failed to upload image. Please try again.',
      details: error.message,
    });
  }
}
