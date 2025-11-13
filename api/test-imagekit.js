// Test endpoint to debug ImageKit auth issues
const ImageKit = require('imagekit');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check environment variables
    const envCheck = {
      hasPublicKey: !!process.env.VITE_IMAGEKIT_PUBLIC_KEY,
      hasPrivateKey: !!process.env.IMAGEKIT_PRIVATE_KEY,
      hasUrlEndpoint: !!process.env.VITE_IMAGEKIT_URL_ENDPOINT,
      publicKeyLength: process.env.VITE_IMAGEKIT_PUBLIC_KEY?.length || 0,
      privateKeyLength: process.env.IMAGEKIT_PRIVATE_KEY?.length || 0,
    };

    console.log('Env check:', envCheck);

    if (!envCheck.hasPublicKey || !envCheck.hasPrivateKey || !envCheck.hasUrlEndpoint) {
      return res.status(500).json({
        error: 'Missing environment variables',
        envCheck
      });
    }

    // Try to create ImageKit instance
    const imagekit = new ImageKit({
      publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT,
    });

    console.log('ImageKit instance created');

    // Try to get auth params
    const authParams = imagekit.getAuthenticationParameters();

    console.log('Auth params generated:', { hasToken: !!authParams.token, hasExpire: !!authParams.expire });

    return res.status(200).json({
      success: true,
      envCheck,
      hasAuthParams: true,
      authParamsKeys: Object.keys(authParams),
    });

  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({
      error: error.message,
      stack: error.stack,
      type: error.constructor.name,
    });
  }
};
