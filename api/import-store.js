/**
 * Vercel Serverless Function: Single Store Import
 *
 * Purpose: Import a single store from Google Maps URL or Place ID
 *
 * Flow:
 * 1. Accepts: Google Maps URL or Place ID
 * 2. Extracts Place ID from URL if needed
 * 3. Fetches place details from Google Places API
 * 4. Enhances description with Gemini AI
 * 5. Fetches and uploads photos to ImageKit
 * 6. Returns complete store data for review
 *
 * This endpoint does NOT save to database - it returns data for user approval
 */

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

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

function setCorsHeaders(res, origin) {
  const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Extract Place ID from Google Maps URL
 */
function extractPlaceIdFromUrl(url) {
  // Google Maps URLs can have Place ID in several formats:
  // https://maps.google.com/maps?cid=12345
  // https://www.google.com/maps/place/Name/@lat,lng,zoom/data=!3m1!4b1!4m6!3m5!1s0xABC:0xDEF!...
  // https://maps.app.goo.gl/abc123

  try {
    const urlObj = new URL(url);

    // Format 1: CID parameter
    const cid = urlObj.searchParams.get('cid');
    if (cid) {
      // CID needs to be converted - we'll search by name instead
      return null;
    }

    // Format 2: Place ID in data parameter
    const dataParam = urlObj.searchParams.get('data');
    if (dataParam) {
      // Try to extract Place ID from data parameter
      const match = dataParam.match(/!1s([^!]+)/);
      if (match && match[1].startsWith('0x') === false) {
        return match[1];
      }
    }

    // Format 3: Place ID in path
    const pathMatch = url.match(/place\/[^\/]+\/([A-Za-z0-9_-]+)/);
    if (pathMatch) {
      return pathMatch[1];
    }

    return null;
  } catch (e) {
    console.error('Failed to parse URL:', e);
    return null;
  }
}

/**
 * Search for Place ID using Text Search API
 */
async function searchPlaceId(query) {
  const apiKey = process.env.VITE_GOOGLE_PLACES_API_KEY;

  const response = await fetch(
    'https://places.googleapis.com/v1/places:searchText',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'en',
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  const data = await response.json();
  return data.places || [];
}

/**
 * Fetch place details from Google Places API
 */
async function fetchPlaceDetails(placeId) {
  const apiKey = process.env.VITE_GOOGLE_PLACES_API_KEY;
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
    console.error(`❌ Place details API error (${response.status}):`, errorText);
    throw new Error(`Failed to fetch place details: ${response.status}`);
  }

  const data = await response.json();

  return {
    placeId: data.id,
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
    hours: data.regularOpeningHours?.weekdayDescriptions?.join('\n') || '',
  };
}

/**
 * Enhance place details with Gemini AI
 */
async function enhanceWithAI(placeDetails) {
  const apiKey = process.env.VITE_GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('Gemini API key not configured, skipping AI enhancement');
    return {
      description: placeDetails.editorialSummary || `${placeDetails.name} is located at ${placeDetails.address}.`,
      suggestedCategories: [],
    };
  }

  try {
    // Detect main category from types
    const types = placeDetails.types || [];
    let mainCategory = 'Fashion'; // default

    if (types.some(t => t.toLowerCase().includes('cafe') || t.toLowerCase().includes('coffee'))) {
      mainCategory = 'Coffee';
    } else if (types.some(t => ['restaurant', 'food', 'bar', 'meal_takeaway'].some(ft => t.toLowerCase().includes(ft)))) {
      mainCategory = 'Food';
    } else if (types.some(t => ['store', 'furniture', 'home_goods'].some(ft => t.toLowerCase().includes(ft)))) {
      mainCategory = 'Home Goods';
    } else if (types.some(t => t.toLowerCase().includes('museum'))) {
      mainCategory = 'Museum';
    }

    // Prepare reviews
    const reviewTexts = (placeDetails.reviews || [])
      .filter(r => r.text?.text)
      .slice(0, 5)
      .map((r, idx) => `Review ${idx + 1}: "${r.text.text}"`)
      .join('\n\n');

    const prompt = `You are writing a description for a Japan map/directory website.

Store Information:
- Name: ${placeDetails.name}
- Location: ${placeDetails.address}
- Type: ${types.join(', ')}
- Category: ${mainCategory}
${placeDetails.editorialSummary ? `- Summary: ${placeDetails.editorialSummary}` : ''}

Reviews:
${reviewTexts || 'No reviews available'}

Task: Write a single-paragraph description (4-6 sentences) for this place.

RULES:
- Do NOT mention ratings, reviews, or customer quotes
- Focus on: what it is, what you can find, what makes it special
- Use concrete, specific details
- Professional and informative tone

Also suggest 2-3 subcategories from this list based on the place type:
Fashion: vintage, archive, streetwear, designer, accessories, denim, sneakers, second-hand
Food: ramen, sushi, izakaya, kaiseki, yakitori, tempura, udon, soba, curry, tonkatsu
Coffee: specialty coffee, cafe, tea, bakery
Home Goods: antiques, furniture, ceramics, textiles, vintage, design
Museum: art, history, design, contemporary

Return JSON:
{
  "description": "your description",
  "suggestedCategories": ["category1", "category2"],
  "instagram": "@handle or not_found"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        description: parsed.description || placeDetails.editorialSummary,
        suggestedCategories: parsed.suggestedCategories || [],
        instagram: parsed.instagram !== 'not_found' ? parsed.instagram : undefined,
      };
    }

    // Fallback if parsing fails
    return {
      description: placeDetails.editorialSummary || `${placeDetails.name} is located at ${placeDetails.address}.`,
      suggestedCategories: [],
    };

  } catch (error) {
    console.error('AI enhancement error:', error);
    return {
      description: placeDetails.editorialSummary || `${placeDetails.name} is located at ${placeDetails.address}.`,
      suggestedCategories: [],
    };
  }
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
    const { input } = req.body; // Can be URL or Place ID

    if (!input) {
      return res.status(400).json({ error: 'Missing required field: input (Google Maps URL or Place ID)' });
    }

    console.log(`🔍 Processing input: ${input}`);

    // Step 1: Extract or search for Place ID
    let placeId = input;

    // If input looks like a URL, try to extract Place ID
    if (input.startsWith('http')) {
      placeId = extractPlaceIdFromUrl(input);

      // If extraction failed, try searching
      if (!placeId) {
        console.log('📍 Could not extract Place ID from URL, searching...');
        const searchResults = await searchPlaceId(input);

        if (!searchResults || searchResults.length === 0) {
          return res.status(404).json({
            error: 'Could not find place. Try pasting the Place ID directly.',
          });
        }

        // Use first result
        placeId = searchResults[0].id;
        console.log(`✓ Found via search: ${searchResults[0].displayName.text}`);
      }
    }

    // Step 2: Fetch place details
    console.log(`📥 Fetching place details for: ${placeId}`);
    const placeDetails = await fetchPlaceDetails(placeId);

    // Step 3: Enhance with AI
    console.log(`🤖 Enhancing with AI...`);
    const aiEnhancement = await enhanceWithAI(placeDetails);

    // Step 4: Return data (photos will be fetched separately if user approves)
    const result = {
      success: true,
      placeId: placeDetails.placeId,
      name: placeDetails.name,
      address: placeDetails.address,
      location: {
        latitude: placeDetails.latitude,
        longitude: placeDetails.longitude,
      },
      description: aiEnhancement.description,
      website: placeDetails.website,
      phone: placeDetails.phone,
      hours: placeDetails.hours,
      instagram: aiEnhancement.instagram,
      rating: placeDetails.rating,
      userRatingCount: placeDetails.userRatingCount,
      types: placeDetails.types,
      suggestedCategories: aiEnhancement.suggestedCategories,
      photoCount: placeDetails.photos.length,
    };

    console.log(`✅ Store import prepared: ${result.name}`);

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error in import-store:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to import store',
      details: error.stack,
    });
  }
}
