/**
 * discover-store — Supabase Edge Function
 *
 * Intake endpoint for Muse's automated store discovery. Not part of the
 * public site — Muse is the only caller. Dedupes against both published
 * stores and the pending/rejected review queue, geocodes via Google Places,
 * fetches an Instagram/Threads oEmbed preview, and inserts a
 * `store_suggestions` row for Alex to review in the rich review card.
 * Nothing published here ever reaches the live map without Alex approving
 * it in the Admin Dashboard (that approval step is promoteSuggestion(),
 * client-side — see src/utils/promoteSuggestion.ts).
 *
 * Auth: two layers.
 *   1. Supabase's own JWT check (this function is deployed with
 *      verify_jwt=true) — the caller needs a valid `Authorization: Bearer
 *      <key>` header (not just `apikey` — see the design doc, this tripped
 *      up the first real test call).
 *   2. A second, function-specific secret in the `x-discovery-key` header,
 *      checked against the DISCOVERY_BOT_KEY environment secret. This is
 *      what actually restricts the endpoint to Muse: the anon key alone
 *      isn't a real secret (it's public, shipped in the frontend), so layer
 *      1 by itself would let anyone call this. Fails closed if
 *      DISCOVERY_BOT_KEY isn't configured.
 *
 * Rate limit: 200 discovery_bot submissions per UTC calendar day, enforced
 * here (not just trusted from Muse's own self-throttling).
 *
 * Dedup (via find_store_duplicates()): google_place_id exact match or
 * Instagram handle match = a confident duplicate. A confident match against
 * a *published* store means "already on the map" — nothing is written. A
 * match against a *pending* suggestion means "already queued" — bumps
 * times_seen/last_seen_at instead of creating a new row. A match against a
 * *rejected* suggestion means "already looked at and turned down" — same
 * bump, but a distinct `already_rejected` response, so a candidate Alex
 * already said no to doesn't silently re-queue every time Muse re-finds it
 * (Phase 2 fix — this tier used to only check pending rows). A weak match
 * (fuzzy name, or geo-proximity + weaker name) still gets inserted, just
 * flagged via possible_duplicate_of for review.
 *
 * Geocoding: every candidate is geocoded at submission time via Google
 * Places Text Search, independent of anything Muse resolved client-side.
 * The field mask now also asks for photo references (photos are lazily
 * resolved to real images by the dashboard, only when a card is opened —
 * not fetched here, to avoid spending Places Photo quota / storage on
 * candidates that get bulk-rejected unseen).
 *
 * oEmbed: Instagram and Threads post previews, fetched here rather than
 * client-side so the dashboard never carries a Meta call in its render
 * path. As of a June 2026 Meta policy change this needs no access token or
 * developer app — a plain GET to the public oEmbed endpoints. Verified
 * live against a real Instagram post and a real Threads post before this
 * shipped (see the design doc). Note: Meta's current response has no
 * `thumbnail_url`/`author_name` field on either platform (removed in an
 * earlier, separate change) — only `html` is reliably present, so the
 * review card renders the real embed widget, not a cached thumbnail.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const DAILY_CAP = 200;
const OEMBED_TIMEOUT_MS = 6000;

const CATEGORY_HINT_TO_MAIN_CATEGORY: Record<string, string> = {
  vintage: 'Fashion',
  archive: 'Fashion',
  designer: 'Fashion',
  streetwear: 'Fashion',
  cafe: 'Coffee',
  spot: 'Spots',
};

interface DiscoverStoreRequest {
  name?: unknown;
  city?: unknown;
  source_ref?: unknown;
  neighborhood?: unknown;
  address?: unknown;
  instagram?: unknown;
  category_hint?: unknown;
  notes?: unknown;
  follower_count?: unknown;
}

interface DuplicateRow {
  match_table: 'stores' | 'store_suggestions';
  match_id: string;
  tier: 'google_place_id' | 'instagram' | 'fuzzy_name' | 'geo_proximity';
  confident: boolean;
  status: 'pending' | 'rejected' | 'approved' | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok');
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // ── Layer 2 auth: the secret that actually gates this endpoint ──────
  const discoveryKey = Deno.env.get('DISCOVERY_BOT_KEY');
  if (!discoveryKey) {
    console.error('DISCOVERY_BOT_KEY is not configured');
    return json({ error: 'Endpoint not configured' }, 500);
  }
  if (req.headers.get('x-discovery-key') !== discoveryKey) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // ── Parse + validate body ────────────────────────────────────────
  let body: DiscoverStoreRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const city = typeof body.city === 'string' ? body.city.trim() : '';
  const sourceRef = typeof body.source_ref === 'string' ? body.source_ref.trim() : '';

  if (!name || name.length > 200) {
    return json({ error: 'name is required (1-200 chars)' }, 422);
  }
  if (!city || city.length > 100) {
    return json({ error: 'city is required (1-100 chars)' }, 422);
  }
  if (!sourceRef) {
    return json({ error: 'source_ref is required (the Instagram/Threads post URL)' }, 422);
  }

  const neighborhood = cleanString(body.neighborhood, 100);
  const address = cleanString(body.address, 300);
  const notes = cleanString(body.notes, 2000);
  const categoryHint = cleanString(body.category_hint, 50);
  const instagramRaw = cleanString(body.instagram, 200);
  const instagram = instagramRaw
    ? `@${instagramRaw.replace(/^@+/, '').replace(/\/+$/, '')}`
    : null;
  const followerCount =
    typeof body.follower_count === 'number' && Number.isFinite(body.follower_count)
      ? Math.max(0, Math.round(body.follower_count))
      : null;

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // ── Rate limit (checked before spending a Places API call) ──────────
  const startOfDayUtc = new Date();
  startOfDayUtc.setUTCHours(0, 0, 0, 0);

  const { count: todayCount, error: countError } = await admin
    .from('store_suggestions')
    .select('id', { count: 'exact', head: true })
    .eq('source', 'discovery_bot')
    .gte('created_at', startOfDayUtc.toISOString());

  if (countError) {
    console.error('rate-limit count error', countError);
    return json({ error: 'Internal error' }, 500);
  }
  if ((todayCount ?? 0) >= DAILY_CAP) {
    return json({ error: `Too many submissions today. Limit: ${DAILY_CAP}/day.` }, 429);
  }

  // ── Geocode + oEmbed in parallel (independent lookups) ───────────────
  const [geocode, oembed] = await Promise.all([
    geocodeCandidate(name, address, neighborhood, city),
    fetchOEmbed(sourceRef),
  ]);

  // ── Dedup: one round trip covering all tiers ─────────────────────────
  const { data: matches, error: dupError } = await admin.rpc('find_store_duplicates', {
    p_name: name,
    p_city: city,
    p_instagram: instagram,
    p_google_place_id: geocode.place_id ?? null,
    p_lng: geocode.lng ?? null,
    p_lat: geocode.lat ?? null,
  });

  if (dupError) {
    console.error('find_store_duplicates error', dupError);
    return json({ error: 'Internal error' }, 500);
  }

  const rows = (matches ?? []) as DuplicateRow[];
  const confidentStoreMatch = rows.find((r) => r.match_table === 'stores' && r.confident);
  const suggestionMatch = rows.find((r) => r.match_table === 'store_suggestions');
  const weakStoreMatch = rows.find((r) => r.match_table === 'stores' && !r.confident);

  if (confidentStoreMatch) {
    return json(
      {
        status: 'duplicate',
        matched_id: confidentStoreMatch.match_id,
        matched_table: 'stores',
        match_tier: confidentStoreMatch.tier,
      },
      200,
    );
  }

  if (suggestionMatch) {
    const { data: bumped, error: bumpError } = await admin
      .rpc('bump_suggestion_sighting', { p_id: suggestionMatch.match_id })
      .single();

    if (bumpError) {
      console.error('bump_suggestion_sighting error', bumpError);
      return json({ error: 'Internal error' }, 500);
    }

    const timesSeen = (bumped as { times_seen: number } | null)?.times_seen ?? null;

    if (suggestionMatch.status === 'rejected') {
      return json(
        { status: 'already_rejected', suggestion_id: suggestionMatch.match_id, times_seen: timesSeen },
        200,
      );
    }

    return json(
      { status: 'already_queued', suggestion_id: suggestionMatch.match_id, times_seen: timesSeen },
      200,
    );
  }

  // ── Genuinely new: insert ────────────────────────────────────────────
  const mainCategory = categoryHint
    ? CATEGORY_HINT_TO_MAIN_CATEGORY[categoryHint.toLowerCase()] ?? null
    : null;

  const insertPayload: Record<string, unknown> = {
    store_name: name,
    city,
    neighborhood,
    // Prefer whatever Muse extracted from the post itself; Places' own
    // formatted_address is a solid fallback when the post didn't have one
    // (the common case) — it's already being fetched below for geocoding,
    // it was just never written here before.
    address: address || geocode.formatted_address || null,
    instagram,
    notes,
    source: 'discovery_bot',
    source_ref: sourceRef,
    category_hint: categoryHint,
    main_category: mainCategory,
    google_place_id: geocode.place_id ?? null,
    geocode_confidence: geocode.confidence,
    possible_duplicate_of: weakStoreMatch ? weakStoreMatch.match_id : null,
    status: 'pending',
    lat: geocode.lat ?? null,
    lng: geocode.lng ?? null,
    google_photo_names: geocode.photo_names && geocode.photo_names.length > 0 ? geocode.photo_names : null,
    follower_count: followerCount,
    oembed_html: oembed.attempted ? oembed.html : null,
    oembed_thumbnail_url: oembed.attempted ? oembed.thumbnail_url : null,
    oembed_author_name: oembed.attempted ? oembed.author_name : null,
    oembed_fetched_at: oembed.attempted ? new Date().toISOString() : null,
  };
  if (geocode.lat != null && geocode.lng != null) {
    insertPayload.location = `POINT(${geocode.lng} ${geocode.lat})`;
  }

  const { data: inserted, error: insertError } = await admin
    .from('store_suggestions')
    .insert(insertPayload)
    .select('id')
    .single();

  if (insertError) {
    console.error('store_suggestions insert error', insertError);
    return json({ error: 'Failed to save suggestion' }, 500);
  }

  return json(
    {
      status: 'queued',
      suggestion_id: inserted!.id,
      geocode_confidence: geocode.confidence,
      ...(weakStoreMatch ? { possible_duplicate_of: weakStoreMatch.match_id } : {}),
    },
    201,
  );
});

function cleanString(v: unknown, maxLen: number): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

interface GeocodeResult {
  confidence: 'high' | 'low' | 'none';
  place_id?: string;
  lat?: number;
  lng?: number;
  formatted_address?: string;
  photo_names?: string[];
}

async function geocodeCandidate(
  name: string,
  address: string | null,
  neighborhood: string | null,
  city: string,
): Promise<GeocodeResult> {
  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY not configured');
    return { confidence: 'none' };
  }

  const locationPart = address || neighborhood || '';
  const textQuery = [name, locationPart, city, 'Japan'].filter(Boolean).join(', ');

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.businessStatus,places.photos',
      },
      body: JSON.stringify({ textQuery, languageCode: 'ja' }),
    });

    if (!res.ok) {
      console.error('Places searchText failed', res.status, await res.text());
      return { confidence: 'none' };
    }

    const data = await res.json();
    const place = data.places?.[0];
    if (!place) {
      return { confidence: 'none' };
    }

    const confidence: 'high' | 'low' =
      !place.businessStatus || place.businessStatus === 'OPERATIONAL' ? 'high' : 'low';

    const photoNames: string[] = Array.isArray(place.photos)
      ? place.photos
          .slice(0, 3)
          .map((p: { name?: unknown }) => (typeof p.name === 'string' ? p.name : null))
          .filter((n: string | null): n is string => !!n)
      : [];

    return {
      confidence,
      place_id: place.id,
      lat: place.location?.latitude,
      lng: place.location?.longitude,
      formatted_address: place.formattedAddress,
      photo_names: photoNames,
    };
  } catch (err) {
    console.error('geocodeCandidate error', err);
    return { confidence: 'none' };
  }
}

interface OEmbedResult {
  attempted: boolean;
  html: string | null;
  thumbnail_url: string | null;
  author_name: string | null;
}

/**
 * Fetches an oEmbed preview for a public Instagram or Threads post URL.
 * No access token or developer app needed as of Meta's June 2026 policy
 * change — verified live against both endpoints before this shipped.
 * Note Meta's current response carries no thumbnail_url/author_name on
 * either platform (a separate, earlier change), so `html` is the only
 * field reliably present — the dashboard renders the real embed widget.
 */
async function fetchOEmbed(sourceRef: string): Promise<OEmbedResult> {
  const empty: OEmbedResult = { attempted: false, html: null, thumbnail_url: null, author_name: null };

  let host: string;
  try {
    host = new URL(sourceRef).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return empty;
  }

  let endpoint: string;
  if (host === 'instagram.com') {
    endpoint = `https://graph.facebook.com/v21.0/instagram_oembed?url=${encodeURIComponent(sourceRef)}&omitscript=true`;
  } else if (host === 'threads.com' || host === 'threads.net') {
    endpoint = `https://graph.threads.com/v1.0/oembed?url=${encodeURIComponent(sourceRef)}`;
  } else {
    // Unrecognized platform — not attempted, not an error.
    return empty;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OEMBED_TIMEOUT_MS);
    const res = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error('oEmbed fetch failed', host, res.status, await res.text());
      return { attempted: true, html: null, thumbnail_url: null, author_name: null };
    }

    const data = await res.json();
    const html = typeof data.html === 'string' ? stripScriptTags(data.html) : null;

    return {
      attempted: true,
      html,
      thumbnail_url: typeof data.thumbnail_url === 'string' ? data.thumbnail_url : null,
      author_name: typeof data.author_name === 'string' ? data.author_name : null,
    };
  } catch (err) {
    console.error('fetchOEmbed error', host, err);
    return { attempted: true, html: null, thumbnail_url: null, author_name: null };
  }
}

function stripScriptTags(html: string): string {
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
