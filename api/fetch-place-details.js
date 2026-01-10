/**
 * Vercel Serverless Function: Fetch Place Details
 *
 * Purpose: Server-side place details fetcher (bypasses referrer restrictions)
 *
 * Flow:
 * 1. Accepts: { placeId }
 * 2. Fetches place details from Google Places API (new API)
 * 3. Returns formatted place details
 */

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

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
 * Fetch place details from Google Places API (new API)
 */
async function fetchPlaceDetails(placeId) {
  const apiKey = process.env.GOOGLE_PLACES_SERVER_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error('Google Places API key not configured');
  }

  // Handle both formats: "ChIJ..." and "places/ChIJ..."
  const resourceName = placeId.startsWith('places/') ? placeId : `places/${placeId}`;

  console.log(`🔍 Fetching place details for: ${resourceName}`);

  const response = await fetch(
    `https://places.googleapis.com/v1/${resourceName}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,editorialSummary,regularOpeningHours,websiteUri,internationalPhoneNumber,rating,userRatingCount,photos,reviews,types,priceLevel',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Google Places API error (${response.status}):`, errorText);
    throw new Error(`Failed to fetch place details: ${response.status}`);
  }

  const data = await response.json();

  console.log(`✅ Place details fetched: ${data.displayName?.text || 'Unknown'}`);

  return {
    placeId: data.id || placeId,
    name: data.displayName?.text || '',
    address: data.formattedAddress || '',
    latitude: data.location?.latitude || 0,
    longitude: data.location?.longitude || 0,
    editorialSummary: data.editorialSummary?.text || '',
    website: data.websiteUri || '',
    phone: data.internationalPhoneNumber || '',
    rating: data.rating || 0,
    userRatingCount: data.userRatingCount || 0,
    photos: data.photos || [],
    reviews: data.reviews || [],
    types: data.types || [],
    priceLevel: data.priceLevel || '',
    description: data.editorialSummary?.text || '',
    hours: data.regularOpeningHours?.weekdayDescriptions?.join('\n') || '',
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
      error: 'Too many requests. Please wait a moment.',
    });
  }

  try {
    const { placeId } = req.body;

    if (!placeId) {
      return res.status(400).json({ error: 'placeId is required' });
    }

    console.log(`📍 Fetching place details for: ${placeId}`);

    const placeDetails = await fetchPlaceDetails(placeId);

    return res.status(200).json({
      success: true,
      placeDetails,
    });

  } catch (error) {
    console.error('❌ Error fetching place details:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch place details',
    });
  }
}
