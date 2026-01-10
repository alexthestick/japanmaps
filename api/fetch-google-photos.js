/**
 * Vercel Serverless Function: Fetch Google Photos → Upload to ImageKit
 *
 * Purpose: Server-side photo fetcher for bulk/single store imports
 * No authentication required (uses server-side API keys only)
 *
 * Flow:
 * 1. Accepts: { placeId, storeId, maxPhotos }
 * 2. Fetches photos from Google Places API
 * 3. Downloads each photo
 * 4. Uploads to ImageKit
 * 5. Returns: Array of ImageKit URLs
 *
 * Used by:
 * - BulkImportQueue.tsx
 * - Single store import flow
 */
import ImageKit from '@imagekit/nodejs';

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// Allowed origins
const PRODUCTION_DOMAIN = process.env.PRODUCTION_URL || 'https://lostintransitjp.com';
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://lostintransitjp.com',
  'https://www.lostintransitjp.com',
  PRODUCTION_DOMAIN,
];

function isOriginAllowed(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (origin.includes('lostintransitjp.com')) return true;
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

function setCorsHeaders(res, origin) {
  const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Fetch place photos from Google Places API (legacy)
 */
async function fetchPlacePhotos(placeId) {
  const apiKey = process.env.GOOGLE_PLACES_SERVER_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error('Google Places API key not configured');
  }

  // Remove 'places/' prefix if present (legacy API uses raw place_id)
  const cleanPlaceId = placeId.replace('places/', '');

  console.log(`🔍 Fetching photos for: ${cleanPlaceId}`);

  // Use legacy Place Details API to get photo references
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${cleanPlaceId}&fields=photos&key=${apiKey}`;

  const response = await fetch(detailsUrl);

  if (!response.ok) {
    console.error(`❌ Google Places API error (${response.status})`);
    throw new Error(`Failed to fetch place photos: ${response.status}`);
  }

  const data = await response.json();

  if (data.status === 'REQUEST_DENIED') {
    console.error('API request denied:', data.error_message);
    throw new Error(`API denied: ${data.error_message || 'Check API key permissions'}`);
  }

  if (data.status !== 'OK' || !data.result) {
    console.error('Place not found:', data.status);
    return [];
  }

  return data.result.photos || [];
}

/**
 * Download photo from Google Places API (legacy)
 */
async function downloadGooglePhoto(photoReference, apiKey) {
  // Legacy API uses photo_reference instead of photo name
  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photoReference}&key=${apiKey}`;

  const response = await fetch(photoUrl);

  if (!response.ok) {
    throw new Error(`Failed to download photo: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Upload photo to ImageKit
 */
async function uploadToImageKit(buffer, fileName, storeId) {
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

  const uploadResult = await imagekit.upload({
    file: buffer,
    fileName: fileName,
    folder: `/stores/imports/${storeId}`,
    useUniqueFileName: true,
    tags: ['store', 'japan-maps', 'import', storeId],
  });

  return {
    url: uploadResult.url,
    fileId: uploadResult.fileId,
    thumbnailUrl: uploadResult.thumbnailUrl,
  };
}

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
      error: 'Too many requests. Please try again later.',
      retryAfter: 60
    });
  }

  try {
    const { placeId, storeId, maxPhotos = 5 } = req.body;

    if (!placeId || !storeId) {
      return res.status(400).json({
        error: 'Missing required fields: placeId, storeId'
      });
    }

    console.log(`📸 Starting photo fetch for store: ${storeId}, place: ${placeId}`);

    // Step 1: Fetch photos from Google Places API
    const photos = await fetchPlacePhotos(placeId);

    if (!photos || photos.length === 0) {
      console.log(`⚠️ No photos found for place: ${placeId}`);
      return res.status(200).json({
        success: true,
        urls: [],
        message: 'No photos found for this place'
      });
    }

    console.log(`✓ Found ${photos.length} photos, processing up to ${maxPhotos}`);

    // Step 2: Download and upload photos (up to maxPhotos)
    const photoUrls = [];
    const photosToProcess = photos.slice(0, maxPhotos);
    const apiKey = process.env.GOOGLE_PLACES_SERVER_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;

    for (let i = 0; i < photosToProcess.length; i++) {
      const photo = photosToProcess[i];

      try {
        console.log(`📥 Processing photo ${i + 1}/${photosToProcess.length}...`);

        // Download from Google (legacy API uses photo_reference)
        const buffer = await downloadGooglePhoto(photo.photo_reference, apiKey);
        console.log(`✓ Downloaded ${(buffer.length / 1024).toFixed(1)}KB`);

        // Upload to ImageKit
        const fileName = `google-place-${storeId}-${i}.jpg`;
        const uploadResult = await uploadToImageKit(buffer, fileName, storeId);
        console.log(`✓ Uploaded to ImageKit: ${uploadResult.fileId}`);

        photoUrls.push(uploadResult.url);

        // Delay between uploads to avoid rate limits
        if (i < photosToProcess.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`❌ Failed to process photo ${i + 1}:`, error.message);
        // Continue with next photo instead of failing completely
      }
    }

    console.log(`✅ Completed: ${photoUrls.length}/${photosToProcess.length} photos uploaded`);

    return res.status(200).json({
      success: true,
      urls: photoUrls,
      count: photoUrls.length,
      total: photos.length,
    });

  } catch (error) {
    console.error('❌ Error in fetch-google-photos:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch photos',
      details: error.stack,
    });
  }
}
