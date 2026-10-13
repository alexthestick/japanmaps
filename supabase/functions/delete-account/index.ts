/**
 * delete-account — Supabase Edge Function
 *
 * Permanently deletes the calling user's account.
 * All related data (field_notes, gps_checkins, find_comments, saved_stores,
 * profiles) cascades automatically via FK ON DELETE CASCADE.
 *
 * Flow:
 *   1. Verify the caller's JWT manually
 *   2. Call admin.deleteUser(user.id) with the service role key
 *      → auth.users row deleted → all cascades fire
 *   3. Return 200 on success
 *
 * The function uses verify_jwt: false so it can return auth errors with
 * proper JSON bodies. JWT verification is done manually inside.
 *
 * App Store Guideline 5.1.1v compliance: this is the server-side
 * handler for the "Delete account" button in the Profile screen.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

function err(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: corsHeaders,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  // 1. Verify JWT — get the calling user's identity
  const authHeader = req.headers.get('authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return err(401, 'Missing or invalid authorization header.');
  }
  const jwt = authHeader.replace('Bearer ', '');

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } },
  );

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return err(401, 'Invalid or expired session. Please sign in again.');
  }

  // 2. Delete the user with the service role key
  //    All cascades (profiles, field_notes, gps_checkins, etc.) fire automatically.
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error('delete-account error:', deleteError);
    return err(500, 'Account deletion failed. Please try again or contact support.');
  }

  // 3. Success — client should sign out after receiving this
  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: corsHeaders },
  );
});
