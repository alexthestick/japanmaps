/**
 * gps-checkin — Supabase Edge Function
 *
 * Server-side GPS verification for Radar mode check-ins.
 * Called by the React client when the user taps "Stamp Passport".
 *
 * Flow:
 *  1. Verify JWT — user must be authenticated
 *  2. Parse + validate request body
 *  3. Fetch store coordinates from DB (service role)
 *  4. Haversine distance check against dynamic radius
 *     radius = max(50, accuracy_meters * 1.5)
 *  5. If too far → return structured error with exact distance
 *  6. If in range → upsert into gps_checkins
 *     - New stamp:    INSERT
 *     - Re-verify:    UPDATE verified=true (only if new accuracy is good)
 *  7. Return the upserted row
 *
 * Deploy:
 *   supabase functions deploy gps-checkin --no-verify-jwt
 *   (JWT verification is done manually below, giving us the user ID)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Haversine ─────────────────────────────────────────────────
function distanceMeters(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Handler ───────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  function err(status: number, code: string, message: string, extra: Record<string, unknown> = {}) {
    return new Response(JSON.stringify({ error: code, message, ...extra }), {
      status,
      headers: corsHeaders,
    });
  }

  // ── 1. Verify JWT ─────────────────────────────────────────
  const authHeader = req.headers.get('authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return err(401, 'unauthorized', 'Missing or invalid authorization header.');
  }
  const jwt = authHeader.replace('Bearer ', '');

  // Use anon key + JWT to get the calling user's identity
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } },
  );

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return err(401, 'unauthorized', 'Invalid or expired session. Please sign in again.');
  }

  // ── 2. Parse + validate body ──────────────────────────────
  let body: {
    store_id: string;
    latitude: number;
    longitude: number;
    accuracy_meters?: number;
  };

  try {
    body = await req.json();
  } catch {
    return err(400, 'invalid_body', 'Request body must be valid JSON.');
  }

  const { store_id, latitude, longitude, accuracy_meters } = body;

  if (!store_id || typeof store_id !== 'string') {
    return err(400, 'missing_store_id', 'store_id is required.');
  }
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return err(400, 'missing_coords', 'latitude and longitude are required numbers.');
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return err(400, 'invalid_coords', 'Coordinates are out of range.');
  }

  const accuracy = typeof accuracy_meters === 'number' && accuracy_meters > 0
    ? accuracy_meters
    : 999; // treat unknown accuracy as worst-case

  // ── 3. Fetch store coordinates (service role) ─────────────
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: store, error: storeError } = await adminClient
    .from('stores')
    .select('id, name, neighborhood, city, location')
    .eq('id', store_id)
    .single();

  if (storeError || !store) {
    return err(404, 'store_not_found', 'Store not found.');
  }

  // PostGIS geography comes back as GeoJSON from Supabase JS client
  // Shape: { type: 'Point', coordinates: [lng, lat] }
  const coords = store.location as { type: string; coordinates: [number, number] } | null;
  if (!coords || coords.type !== 'Point') {
    return err(500, 'store_no_coords', 'This store does not have GPS coordinates on file.');
  }

  const [storeLng, storeLat] = coords.coordinates;

  // ── 4. Distance check ─────────────────────────────────────
  const distanceM = Math.round(distanceMeters(latitude, longitude, storeLat, storeLng));

  // Dynamic radius: widen when GPS is poor so we don't punish the user
  // for Tokyo's urban canyons. Floor of 50m, cap at 150m regardless.
  const checkinRadius = Math.min(150, Math.max(50, accuracy * 1.5));

  if (distanceM > checkinRadius) {
    return err(422, 'too_far', `You're ${distanceM}m away — get within ${Math.round(checkinRadius)}m to stamp this store.`, {
      distance_meters: distanceM,
      required_meters: Math.round(checkinRadius),
    });
  }

  // ── 5. Determine verified flag ────────────────────────────
  const isVerified = accuracy <= 25;

  // ── 6. Upsert into gps_checkins ───────────────────────────
  //
  // ON CONFLICT (user_id, store_id):
  //   - Always update visited_at, lat/lng, accuracy (records the latest visit)
  //   - Only upgrade verified: false → true, never downgrade true → false
  //     (re-visiting with weak GPS shouldn't invalidate a previously good stamp)
  const { data: checkin, error: upsertError } = await adminClient
    .from('gps_checkins')
    .upsert(
      {
        user_id:         user.id,
        store_id:        store_id,
        visited_at:      new Date().toISOString(),
        latitude,
        longitude,
        accuracy_meters: accuracy === 999 ? null : accuracy,
        neighborhood:    store.neighborhood ?? null,
        city:            store.city ?? null,
        verified:        isVerified,
      },
      {
        onConflict: 'user_id,store_id',
        // For re-verification: only flip verified to true, never to false.
        // We achieve this by reading the existing row's verified value in the
        // response and returning the merged state. Supabase upsert will write
        // whatever we send — so we send verified=true if either old OR new is true.
        // To do this correctly we need to check the existing row first.
        ignoreDuplicates: false,
      },
    )
    .select()
    .single();

  // Handle re-verification: if the upsert overwrote verified=true with false,
  // read back and correct it. (Simpler than a raw SQL upsert for now.)
  if (!upsertError && checkin && !checkin.verified && isVerified === false) {
    // Check if there was a previously verified stamp we just overwrote
    const { data: existing } = await adminClient
      .from('gps_checkins')
      .select('verified')
      .eq('user_id', user.id)
      .eq('store_id', store_id)
      .single();

    if (existing?.verified === true) {
      // Restore verified=true — don't downgrade a good stamp
      await adminClient
        .from('gps_checkins')
        .update({ verified: true })
        .eq('user_id', user.id)
        .eq('store_id', store_id);
    }
  }

  if (upsertError) {
    console.error('gps-checkin upsert error:', upsertError);
    return err(500, 'db_error', 'Failed to record check-in. Please try again.');
  }

  // ── 7. Return success ─────────────────────────────────────
  return new Response(
    JSON.stringify({
      success: true,
      checkin: {
        id:              checkin.id,
        store_id:        checkin.store_id,
        store_name:      store.name,
        neighborhood:    checkin.neighborhood,
        city:            checkin.city,
        visited_at:      checkin.visited_at,
        verified:        checkin.verified,
        accuracy_meters: checkin.accuracy_meters,
        distance_meters: distanceM,
      },
    }),
    { status: 200, headers: corsHeaders },
  );
});
