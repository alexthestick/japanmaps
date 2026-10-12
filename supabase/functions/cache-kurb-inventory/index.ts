import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedCronRequest } from './auth.ts';
import { cursorAfterAttempt, selectBatch, type KurbStore } from './batch.ts';

const BATCH_SIZE = 19;
const BETWEEN_KURB_CALLS_MS = 1_200;
const KURB_TIMEOUT_MS = 10_000;
const RUN_BUDGET_MS = 105_000;
const LEASE_MS = 12 * 60_000; // Expires before the proposed 15-minute cron interval.

interface KurbApiItem {
  id: number;
  title?: string;
  brand?: string;
  price?: number;
  converted_price?: number;
  image_url?: string;
  kurb_url?: string;
  size?: string | null;
  condition?: string | null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function response(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Keep the existing client-side limits: three items per brand, twenty per store.
function capByBrand(items: KurbApiItem[]): KurbApiItem[] {
  const counts: Record<string, number> = {};
  return items.filter((item) => {
    const brand = (item.brand ?? '').toLowerCase();
    counts[brand] = (counts[brand] ?? 0) + 1;
    return counts[brand] <= 3;
  }).slice(0, 20);
}

async function fetchKurbItems(vendorId: number, apiKey: string): Promise<KurbApiItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), KURB_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://api.kurb.online/api/v2/partner/vendor/${vendorId}/items?currency=USD`,
      {
        headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
        signal: controller.signal,
      },
    );
    if (!res.ok) throw new Error(`Kurb HTTP ${res.status}`);
    const json = await res.json();
    const rawItems = json?.data?.items ?? [];
    if (!Array.isArray(rawItems)) throw new Error('Kurb returned an invalid items value');
    return capByBrand(rawItems);
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Kurb request timed out after 10s');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (req: Request) => {
  // This endpoint is invoked only by pg_cron. Fail closed before doing any work,
  // including when the server secret has not been configured.
  if (!isAuthorizedCronRequest(req, Deno.env.get('CRON_SECRET'))) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const startedAt = Date.now();
  const runId = crypto.randomUUID();
  let attempted = 0;
  let fetched = 0;
  let errors = 0;
  const log: string[] = [];

  try {
    const url = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const kurbKey = Deno.env.get('KURB_API_KEY');
    if (!url || !serviceKey || !kurbKey) {
      throw new Error('Required server-side configuration is missing');
    }
    const supabase = createClient(url, serviceKey);

    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, kurb_vendor_id')
      .not('kurb_vendor_id', 'is', null)
      .order('id', { ascending: true });
    if (storesError) throw new Error(`stores fetch failed: ${storesError.message}`);
    const allStores = (stores ?? []) as KurbStore[];
    if (allStores.length === 0) {
      return response({ success: true, message: 'No stores with kurb_vendor_id', attempted: 0, fetched: 0, errors: 0 });
    }

    // An atomic conditional UPDATE claims the singleton cursor row. If a run dies,
    // the lease expires before the next scheduled invocation. The cursor is only
    // advanced after processing, so an interrupted batch is safe to repeat.
    const now = new Date().toISOString();
    const leaseUntil = new Date(Date.now() + LEASE_MS).toISOString();
    const { data: claim, error: claimError } = await supabase
      .from('kurb_cache_state')
      .update({ lease_token: runId, lease_expires_at: leaseUntil })
      .eq('singleton', true)
      .or(`lease_expires_at.is.null,lease_expires_at.lt."${now}"`)
      .select('last_store_id')
      .maybeSingle();
    if (claimError) throw new Error(`cursor claim failed: ${claimError.message}`);
    if (!claim) {
      const { data: cursorRow, error: cursorError } = await supabase
        .from('kurb_cache_state')
        .select('singleton')
        .eq('singleton', true)
        .maybeSingle();
      if (cursorError) throw new Error(`cursor lookup failed: ${cursorError.message}`);
      if (!cursorRow) throw new Error('cursor row missing');
      console.warn('[cache-kurb-inventory] Skipped: another run holds the lease');
      return response({ success: true, skipped: true, reason: 'already running' });
    }

    const previousCursor = claim.last_store_id as string | null;
    const batch = selectBatch(allStores, previousCursor, BATCH_SIZE);
    console.log(`[cache-kurb-inventory] Starting ${batch.length}/${allStores.length} stores`);

    for (const store of batch) {
      if (Date.now() - startedAt >= RUN_BUDGET_MS) {
        console.warn(`[cache-kurb-inventory] Stopping at run budget after ${attempted} stores`);
        break;
      }
      if (attempted > 0) await sleep(BETWEEN_KURB_CALLS_MS);
      attempted++;

      try {
        const items = await fetchKurbItems(store.kurb_vendor_id, kurbKey);
        if (items.length === 0) {
          const { error: deleteError } = await supabase
            .from('kurb_items')
            .delete()
            .eq('store_id', store.id);
          if (deleteError) throw new Error(`cache delete failed: ${deleteError.message}`);
        } else {
          const fetchedAt = new Date().toISOString();
          const rows = items.map((item) => ({
            store_id: store.id,
            kurb_vendor_id: store.kurb_vendor_id,
            item_id: item.id,
            title: item.title ?? null,
            brand: item.brand ?? null,
            price_usd: item.converted_price ?? item.price ?? null,
            image_url: item.image_url ?? null,
            kurb_url: item.kurb_url ?? null,
            size: item.size ?? null,
            condition: item.condition ?? null,
            fetched_at: fetchedAt,
          }));
          const { error: upsertError } = await supabase
            .from('kurb_items')
            .upsert(rows, { onConflict: 'store_id,item_id' });
          if (upsertError) throw new Error(`cache upsert failed: ${upsertError.message}`);

          const freshIds = items.map((item) => item.id);
          const { error: staleError } = await supabase
            .from('kurb_items')
            .delete()
            .eq('store_id', store.id)
            .not('item_id', 'in', `(${freshIds.join(',')})`);
          if (staleError) throw new Error(`stale-item delete failed: ${staleError.message}`);
        }
        fetched++;
        log.push(`store ${store.id}: cached ${items.length} items`);
      } catch (error) {
        errors++;
        const message = error instanceof Error ? error.message : String(error);
        log.push(`store ${store.id}: ${message}`);
        console.error(`[cache-kurb-inventory] store ${store.id}: ${message}`);
      }
    }

    const nextCursor = cursorAfterAttempt(allStores, batch, attempted, previousCursor);
    const { data: released, error: releaseError } = await supabase
      .from('kurb_cache_state')
      .update({
        last_store_id: nextCursor,
        lease_token: null,
        lease_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('singleton', true)
      .eq('lease_token', runId)
      .select('singleton')
      .maybeSingle();
    if (releaseError || !released) {
      throw new Error(`cursor release failed: ${releaseError?.message ?? 'lease lost'}`);
    }

    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(`[cache-kurb-inventory] Done in ${elapsed}s — ${attempted} attempted, ${fetched} ok, ${errors} errors, ${nextCursor === null ? 'cycle complete' : 'more to come'}`);
    return response({ success: true, total_stores: allStores.length, attempted, fetched, errors, elapsed, cycle_complete: nextCursor === null, log });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[cache-kurb-inventory] Fatal:', message);
    return response({ success: false, attempted, fetched, errors, error: message }, 500);
  }
});
