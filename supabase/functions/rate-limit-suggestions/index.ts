/**
 * rate-limit-suggestions — Supabase Edge Function
 *
 * Wraps store_suggestions INSERT with per-user rate limiting.
 *
 * Limit: 3 submissions per 10 minutes per user (authenticated)
 *        or per IP (anonymous — future; currently requires login).
 *
 * The client calls this instead of inserting into store_suggestions directly.
 * The broad WITH CHECK (true) INSERT policy on store_suggestions should remain
 * for the service-role write done here, but the anon/authenticated INSERT
 * policy should be REVOKED so this function is the only insert path.
 *
 * To revoke the direct INSERT policy after deploying this function, run in SQL:
 *   DROP POLICY IF EXISTS "store_suggestions_insert" ON public.store_suggestions;
 *   -- (replace the policy name with whatever exists in your dashboard)
 *
 * Deploy:
 *   supabase functions deploy rate-limit-suggestions
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RATE_LIMIT = 3;        // max submissions
const WINDOW_MINUTES = 10;   // per this many minutes

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // ── Auth ────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // User-scoped client (to verify the JWT)
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // ── Parse body ──────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  // Basic required-field validation
  const { name, city, neighborhood, category, latitude, longitude } = body as {
    name?: string;
    city?: string;
    neighborhood?: string;
    category?: string;
    latitude?: number;
    longitude?: number;
  };

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return json({ error: 'name is required (min 2 chars)' }, 422);
  }
  if (!city || typeof city !== 'string') {
    return json({ error: 'city is required' }, 422);
  }

  // ── Rate-limit check ────────────────────────────────────────
  // Service-role client for rate-limit queries and the final insert
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  const { count, error: countError } = await admin
    .from('store_suggestions')
    .select('id', { count: 'exact', head: true })
    .eq('submitted_by', user.id)
    .gte('created_at', windowStart);

  if (countError) {
    console.error('rate-limit count error', countError);
    return json({ error: 'Internal error' }, 500);
  }

  if ((count ?? 0) >= RATE_LIMIT) {
    return json(
      { error: `Too many submissions — you can submit ${RATE_LIMIT} stores per ${WINDOW_MINUTES} minutes. Please wait a moment.` },
      429,
    );
  }

  // ── Insert ──────────────────────────────────────────────────
  const { data, error: insertError } = await admin
    .from('store_suggestions')
    .insert({
      name: String(name).trim(),
      city: String(city).trim(),
      neighborhood: neighborhood ? String(neighborhood).trim() : null,
      category: category ? String(category).trim() : null,
      latitude: typeof latitude === 'number' ? latitude : null,
      longitude: typeof longitude === 'number' ? longitude : null,
      submitted_by: user.id,
      status: 'pending',
    })
    .select()
    .single();

  if (insertError) {
    console.error('store_suggestions insert error', insertError);
    return json({ error: 'Failed to save suggestion' }, 500);
  }

  return json({ data }, 201);
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
