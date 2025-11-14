// Simple test endpoint - no dependencies
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    success: true,
    message: 'Simple endpoint works!',
    timestamp: new Date().toISOString(),
    envCheck: {
      hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!(process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasImageKitPublic: !!process.env.VITE_IMAGEKIT_PUBLIC_KEY,
      hasImageKitPrivate: !!(process.env.VITE_IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_PRIVATE_KEY),
      hasImageKitEndpoint: !!process.env.VITE_IMAGEKIT_URL_ENDPOINT,
    }
  });
}
