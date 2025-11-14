// List all environment variables (for debugging only)
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Get all env vars that start with our prefixes
  const relevantEnvVars = {};
  for (const key in process.env) {
    if (key.includes('SUPABASE') || key.includes('IMAGEKIT') || key.includes('GOOGLE')) {
      relevantEnvVars[key] = '***' + (process.env[key] || '').slice(-4); // Show last 4 chars only
    }
  }

  return res.status(200).json({
    success: true,
    count: Object.keys(relevantEnvVars).length,
    variables: relevantEnvVars,
    nodeVersion: process.version,
  });
}
