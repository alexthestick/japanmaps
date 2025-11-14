/**
 * Japan Maps - Secure ImageKit Authentication Endpoint
 *
 * Security Features:
 * - Requires authenticated Supabase user
 * - Rate limited per IP (10 requests/minute)
 * - Proper CORS with domain restriction
 * - No secrets leaked in logs
 * - Supports Vercel preview URLs
 */
const ImageKit = require('imagekit');
const { createClient } = require('@supabase/supabase-js');

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// Allowed origins
const PRODUCTION_DOMAIN = process.env.PRODUCTION_URL || 'https://japan-maps.vercel.app';
const ALLOWED_ORIGINS = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000',
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

module.exports = async function handler(req, res) {
  const origin = req.headers.origin;

  if (origin && !isOriginAllowed(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  if (req.method === 'OPTIONS') {
    setCorsHeaders(res, origin);
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
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

  // Authentication check
  const user = await verifyAuth(req);

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized. Please sign in to upload images.'
    });
  }

  try {
    if (!process.env.VITE_IMAGEKIT_PUBLIC_KEY ||
        !process.env.IMAGEKIT_PRIVATE_KEY ||
        !process.env.VITE_IMAGEKIT_URL_ENDPOINT) {
      throw new Error('ImageKit credentials not configured');
    }

    const imagekit = new ImageKit({
      publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT,
    });

    const authParams = imagekit.getAuthenticationParameters();

    console.log(`✅ [Japan Maps] Auth token generated for user: ${user.id}`);

    return res.status(200).json({
      ...authParams,
      userId: user.id,
    });

  } catch (error) {
    console.error('❌ [Japan Maps] ImageKit auth error:', {
      message: error.message,
      userId: user?.id,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      error: 'Failed to generate upload token. Please try again.'
    });
  }
}
