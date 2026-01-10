/**
 * Vercel Serverless Function: Search Places
 *
 * Purpose: Server-side place search (bypasses referrer restrictions)
 *
 * Flow:
 * 1. Accepts: { query, locationBias? }
 * 2. Searches Google Places API
 * 3. Returns matching places
 */

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

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
 * Search places using Google Places API (new API)
 */
async function searchPlaces(query, locationBias) {
  const apiKey = process.env.GOOGLE_PLACES_SERVER_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error('Google Places API key not configured');
  }

  console.log(`🔍 Searching for: ${query}`);

  const searchUrl = 'https://places.googleapis.com/v1/places:searchText';

  const requestBody = {
    textQuery: query,
    languageCode: 'en',
    maxResultCount: 10,
  };

  // Add location bias for Japan if provided or by default
  if (locationBias) {
    requestBody.locationBias = locationBias;
  } else {
    // Default to Japan
    requestBody.locationBias = {
      circle: {
        center: { latitude: 35.6762, longitude: 139.6503 }, // Tokyo
        radius: 500000, // 500km radius covers most of Japan
      },
    };
  }

  const response = await fetch(searchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Google Places API error (${response.status}):`, errorText);
    throw new Error(`Places API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  const places = (data.places || []).map(place => ({
    placeId: place.id?.replace('places/', '') || '',
    name: place.displayName?.text || '',
    address: place.formattedAddress || '',
    latitude: place.location?.latitude || 0,
    longitude: place.location?.longitude || 0,
    types: place.types || [],
  }));

  console.log(`✅ Found ${places.length} places`);

  return places;
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
    const { query, locationBias } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    const places = await searchPlaces(query, locationBias);

    return res.status(200).json({
      success: true,
      places,
    });

  } catch (error) {
    console.error('❌ Error searching places:', error);
    return res.status(500).json({
      error: error.message || 'Failed to search places',
    });
  }
}
