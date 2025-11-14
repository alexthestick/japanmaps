import ImageKit from 'imagekit';
import { createClient } from '@supabase/supabase-js';

// Rate limiting storage (in-memory for dev)
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const limit = 10; // requests
  const window = 60 * 1000; // 1 minute

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const requests = rateLimitMap.get(ip).filter((time) => now - time < window);

  if (requests.length >= limit) {
    return false;
  }

  requests.push(now);
  rateLimitMap.set(ip, requests);
  return true;
}

export default async function handler(req, res) {
  console.log('📸 ImageKit auth request received');

  try {
    // Get client IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
               req.socket.remoteAddress ||
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Maximum 10 requests per minute.',
      });
    }

    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    console.log('🔐 Verifying token with Supabase...');

    // Verify with Supabase
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('📡 Calling Supabase getUser...');
    const authResponse = await supabase.auth.getUser(token);
    console.log('📡 Supabase response:', authResponse);

    if (authResponse.error || !authResponse.data?.user) {
      console.log('❌ Auth failed:', authResponse.error);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    const user = authResponse.data.user;
    console.log('✅ User authenticated:', user.id);

    // Generate ImageKit authentication
    const imagekit = new ImageKit({
      publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT,
    });

    const authParams = imagekit.getAuthenticationParameters();

    return res.status(200).json({
      ...authParams,
      userId: user.id,
      expire: authParams.expire || Date.now() + 600000, // 10 minutes
    });
  } catch (error) {
    console.error('ImageKit auth error:', error);
    return res.status(500).json({
      error: 'Failed to generate authentication parameters',
      details: error.message,
    });
  }
}
