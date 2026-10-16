/**
 * delete-account — Supabase Edge Function
 *
 * Permanently deletes the calling user's account.
 * All related data (field_notes, gps_checkins, find_comments, saved_stores,
 * profiles) cascades automatically via FK ON DELETE CASCADE.
 *
 * Flow:
 *   1. Verify the caller's JWT manually
 *   2. Find owned objects and remove them through the Storage API
 *   3. Call admin.deleteUser(user.id) with the service role key
 *      → auth.users row deleted → all cascades fire
 *   4. Return 200 on success
 *
 * The function uses verify_jwt: false so it can return auth errors with
 * proper JSON bodies. JWT verification is done manually inside.
 *
 * App Store Guideline 5.1.1v compliance: this is the server-side
 * handler for the "Delete account" button in the Profile screen.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AccountDeletionError, cleanupStorageAndDeleteUser } from './storage-cleanup.ts';
import { readAccountDeletionSecretKey } from './secret-key.ts';

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

  const secretKey = readAccountDeletionSecretKey(Deno.env.get('SUPABASE_SECRET_KEYS'));
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (!secretKey || !supabaseUrl) {
    return err(500, 'Account deletion is temporarily unavailable. Please try again later.');
  }

  const adminClient = createClient(supabaseUrl, secretKey);
  let authResponse;
  try {
    authResponse = await adminClient.auth.getUser(jwt);
  } catch {
    return err(500, 'Could not verify your session. Please try again later.');
  }
  const { data: { user }, error: authError } = authResponse;
  if (authError || !user) {
    return err(401, 'Invalid or expired session. Please sign in again.');
  }

  // 2. Remove owned Storage objects before Auth deletion. SQL only reads ownership;
  //    Storage API remove() performs every file deletion.
  try {
    const { removedCount } = await cleanupStorageAndDeleteUser({
      listOwned: async (userId, bucket) => {
        const { data, error } = await adminClient.rpc('list_owned_account_storage_objects', {
          p_user_id: userId,
          p_bucket_id: bucket,
        });
        return { data, error };
      },
      remove: (bucket, paths) => adminClient.storage.from(bucket).remove(paths),
      deleteUser: (userId) => adminClient.auth.admin.deleteUser(userId),
    }, user.id);
    console.info('delete-account completed:', { files_removed: removedCount, errors: 0 });
  } catch (error) {
    const removedCount = error instanceof AccountDeletionError ? error.removedCount : 0;
    console.error('delete-account failed:', { files_removed: removedCount, errors: 1 });
    if (error instanceof AccountDeletionError && error.stage === 'cleanup') {
      return err(500, 'Could not remove all account files. Your account was not deleted. Please try again or contact support.');
    }
    return err(500, 'Account deletion failed. Please try again or contact support.');
  }

  // 4. Success — client should sign out after receiving this
  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: corsHeaders },
  );
});
