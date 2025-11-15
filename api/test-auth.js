import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({
      error: 'No auth header provided',
      help: 'Send Authorization: Bearer <token> header'
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Supabase URL:', supabaseUrl ? '✓' : '✗');
    console.log('Service Role Key:', serviceRoleKey ? '✓' : '✗');
    console.log('Token length:', token?.length);

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        error: 'Server configuration error',
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceRoleKey
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({
        error: 'Auth verification failed',
        details: error.message,
        code: error.code
      });
    }

    if (!user) {
      return res.status(401).json({
        error: 'No user found'
      });
    }

    return res.status(200).json({
      success: true,
      userId: user.id,
      email: user.email,
      message: 'Auth working correctly!'
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Unexpected error',
      message: error.message
    });
  }
}
