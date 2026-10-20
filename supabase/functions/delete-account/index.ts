/**
 * delete-account — Supabase Edge Function
 *
 * Permanently deletes the calling user's account.
 * All related data (field_notes, gps_checkins, find_comments, saved_stores,
 * profiles) cascades automatically via FK ON DELETE CASCADE.
 *
 * Flow:
 *   1. Verify the caller's JWT manually
 *   2. Remove ImageKit Finds photos by exact owned Find URL
 *   3. Find owned objects and remove them through the Storage API
 *   4. Call admin.deleteUser(user.id) with the named Supabase secret key
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
import { cleanupImageKitFindPhotos } from './imagekit-cleanup.ts';

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

  // 2. Remove ImageKit Finds photos and owned Storage objects before Auth deletion.
  //    Database lookups are read-only; provider APIs perform every file deletion.
  try {
    const { removedCount, imagekitRemovedCount } = await cleanupStorageAndDeleteUser({
      cleanupImageKit: (userId) => cleanupImageKitFindPhotos({
        listFindPhotos: async (id, from, to) => {
          const { data, error } = await adminClient.from('field_notes').select('photo_url')
            .eq('user_id', id).order('id').range(from, to);
          return { data, error };
        },
        isReferencedElsewhere: async (id, urls) => {
          for (let start = 0; start < urls.length; start += 25) {
            const batch = urls.slice(start, start + 25);
            const otherNotes = await adminClient.from('field_notes').select('id')
              .in('photo_url', batch).neq('user_id', id).limit(1);
            if (otherNotes.error) throw new Error('Find reference check failed');
            const stores = await adminClient.from('stores').select('id')
              .overlaps('photos', batch).limit(1);
            if (stores.error) throw new Error('Store reference check failed');
            if ((otherNotes.data?.length ?? 0) > 0 || (stores.data?.length ?? 0) > 0) return true;
          }
          return false;
        },
        listAssets: async (folder, skip, limit) => {
          const key = Deno.env.get('IMAGEKIT_PRIVATE_KEY');
          if (!key) throw new Error('ImageKit credential unavailable');
          const url = new URL('https://api.imagekit.io/v1/files');
          url.searchParams.set('path', folder);
          url.searchParams.set('type', 'file');
          url.searchParams.set('skip', String(skip));
          url.searchParams.set('limit', String(limit));
          const response = await fetch(url, {
            headers: { Authorization: `Basic ${btoa(`${key}:`)}` },
            signal: AbortSignal.timeout(10000),
          });
          if (!response.ok) throw new Error('ImageKit listing failed');
          return response.json();
        },
        deleteAsset: async (fileId) => {
          const key = Deno.env.get('IMAGEKIT_PRIVATE_KEY');
          if (!key) throw new Error('ImageKit credential unavailable');
          const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, {
            method: 'DELETE',
            headers: { Authorization: `Basic ${btoa(`${key}:`)}` },
            signal: AbortSignal.timeout(10000),
          });
          if (!response.ok) throw new Error('ImageKit deletion failed');
        },
      }, userId),
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
    console.info('delete-account completed:', { storage_files_removed: removedCount, imagekit_files_removed: imagekitRemovedCount, errors: 0 });
  } catch (error) {
    const removedCount = error instanceof AccountDeletionError ? error.removedCount : 0;
    const imagekitRemovedCount = error instanceof AccountDeletionError ? error.imagekitRemovedCount : 0;
    console.error('delete-account failed:', { storage_files_removed: removedCount, imagekit_files_removed: imagekitRemovedCount, errors: 1 });
    if (error instanceof AccountDeletionError && error.stage === 'cleanup') {
      return err(500, 'Could not remove all account photos and files. Your account was not deleted. Please try again or contact support.');
    }
    return err(500, 'Account deletion failed. Please try again or contact support.');
  }

  // 4. Success — client should sign out after receiving this
  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: corsHeaders },
  );
});
