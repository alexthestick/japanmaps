import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const KURB_API_KEY = Deno.env.get('KURB_API_KEY');

// Uses service role so it can bypass RLS and write to kurb_items
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Mirrors the client-side cap: max 3 items per brand per store
function capByBrand(items: KurbApiItem[], maxPerBrand = 3): KurbApiItem[] {
  const counts: Record<string, number> = {};
  return items.filter(item => {
    const key = (item.brand ?? '').toLowerCase();
    counts[key] = (counts[key] ?? 0) + 1;
    return counts[key] <= maxPerBrand;
  });
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

Deno.serve(async (_req: Request) => {
  const startedAt = Date.now();
  console.log('[cache-kurb-inventory] Starting cache refresh');

  try {
    // 1. Fetch all stores that have a Kurb vendor ID
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, kurb_vendor_id')
      .not('kurb_vendor_id', 'is', null);

    if (storesError) throw new Error(`stores fetch failed: ${storesError.message}`);
    if (!stores || stores.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No stores with kurb_vendor_id', fetched: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[cache-kurb-inventory] Processing ${stores.length} stores`);

    if (!KURB_API_KEY) {
      console.warn('[cache-kurb-inventory] KURB_API_KEY not set — skipping live fetch');
      return new Response(JSON.stringify({ success: false, error: 'KURB_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let fetched = 0;
    let errors = 0;
    const log: string[] = [];

    for (let i = 0; i < stores.length; i++) {
      const store = stores[i];

      // Rate limit: stay safely under 60 req/min (~50/min = 1.2s between requests)
      if (i > 0) await sleep(1200);

      try {
        const res = await fetch(
          `https://api.kurb.online/api/v2/partner/vendor/${store.kurb_vendor_id}/items?currency=USD`,
          {
            headers: {
              'X-API-Key': KURB_API_KEY,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!res.ok) {
          errors++;
          log.push(`store ${store.id}: HTTP ${res.status}`);
          continue;
        }

        const json = await res.json();
        const rawItems: KurbApiItem[] = json?.data?.items ?? [];
        // Apply same cap as client-side KurbInventory
        const items = capByBrand(rawItems).slice(0, 20);

        // If vendor has no items, clear any stale cache rows
        if (items.length === 0) {
          await supabase.from('kurb_items').delete().eq('store_id', store.id);
          fetched++;
          continue;
        }

        const now = new Date().toISOString();
        const rows = items.map((item: KurbApiItem) => ({
          store_id:       store.id,
          kurb_vendor_id: store.kurb_vendor_id,
          item_id:        item.id,
          title:          item.title     ?? null,
          brand:          item.brand     ?? null,
          price_usd:      item.converted_price ?? item.price ?? null,
          image_url:      item.image_url ?? null,
          kurb_url:       item.kurb_url  ?? null,
          size:           item.size      ?? null,
          condition:      item.condition ?? null,
          fetched_at:     now,
        }));

        // Upsert — updates price/image/etc if item already cached, inserts if new
        const { error: upsertError } = await supabase
          .from('kurb_items')
          .upsert(rows, { onConflict: 'store_id,item_id' });

        if (upsertError) {
          errors++;
          log.push(`store ${store.id}: upsert error — ${upsertError.message}`);
          continue;
        }

        // Delete stale rows for this store — items not in latest response are sold
        const freshIds = items.map((i: KurbApiItem) => i.id);
        await supabase
          .from('kurb_items')
          .delete()
          .eq('store_id', store.id)
          .not('item_id', 'in', `(${freshIds.join(',')})`);

        fetched++;
        log.push(`store ${store.id}: cached ${items.length} items`);

      } catch (err) {
        errors++;
        log.push(`store ${store.id}: ${String(err)}`);
      }
    }

    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(`[cache-kurb-inventory] Done in ${elapsed}s — ${fetched} ok, ${errors} errors`);

    return new Response(JSON.stringify({ success: true, fetched, errors, elapsed, log }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[cache-kurb-inventory] Fatal:', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
