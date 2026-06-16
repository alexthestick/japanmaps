import { useEffect, useState } from 'react';
import { ExternalLink, ShoppingBag } from 'lucide-react';

// ---------- Types matching the real Kurb API response ----------

interface KurbItem {
  id: number;
  title: string;
  brand: string;
  price: number;               // source price (JPY)
  source_currency: string;     // 'JPY'
  converted_price: number;     // price in requested currency (USD)
  converted_currency: string;  // 'USD'
  image_url: string;
  kurb_url: string;
  item_type?: string;
  size?: string | null;
  condition?: string | null;
  listed_at?: string;
}

interface KurbVendor {
  id: number;
  name: string;
  instagram?: string | null;
  kurb_url?: string;
}

interface KurbAttribution {
  name: string;
  url: string;
  logo_url: string;
  text: string;
  required: boolean;
}

// The real Kurb API wraps everything: { success, data: { vendor, items, attribution }, meta }
interface KurbApiResponse {
  success: boolean;
  data: {
    vendor: KurbVendor;
    items: KurbItem[];
    attribution: KurbAttribution;
  };
  meta: Record<string, unknown>;
}

interface Props {
  vendorId: number;
  accentColor?: string;
  /** When true, renders a smaller header and limits to 3 items (for map panel / mobile) */
  compact?: boolean;
  /** Override max items shown (default 20 for full, 3 for compact) */
  maxItems?: number;
}

// Cap at 3 items per brand (safety net per API contract)
function capByBrand(items: KurbItem[], maxPerBrand = 3): KurbItem[] {
  const counts: Record<string, number> = {};
  return items.filter(item => {
    const key = (item.brand ?? '').toLowerCase();
    counts[key] = (counts[key] ?? 0) + 1;
    return counts[key] <= maxPerBrand;
  });
}

function formatPrice(item: KurbItem): string {
  const amount = item.converted_price ?? item.price;
  const currency = item.converted_currency ?? item.source_currency ?? 'USD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function KurbInventory({ vendorId, accentColor = '#22D9EE', compact = false, maxItems }: Props) {
  const [items, setItems] = useState<KurbItem[]>([]);
  const [attribution, setAttribution] = useState<KurbAttribution | null>(null);
  const [vendorKurbUrl, setVendorKurbUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(false);

        // Edge function has verify_jwt: false — no auth header needed
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-kurb-inventory?vendor_id=${vendorId}&currency=USD`
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: KurbApiResponse = await res.json();

        if (!cancelled) {
          const payload = json.data ?? (json as any); // graceful fallback for mock
          setAttribution(payload.attribution ?? null);
          setVendorKurbUrl(payload.vendor?.kurb_url ?? null);
          const limit = maxItems ?? (compact ? 6 : 20);
          const capped = capByBrand(payload.items ?? []).slice(0, limit);
          setItems(capped);
        }
      } catch (err) {
        console.error('[KurbInventory] fetch error', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [vendorId]);

  // Don't render at all on error or genuinely empty inventory
  if (!loading && (error || (!items.length && !attribution))) return null;

  const logoUrl = attribution?.logo_url;
  const attributionUrl = attribution?.url ?? 'https://kurb.online';

  return (
    <div className={compact ? 'relative z-10' : 'relative z-10 max-w-6xl mx-auto px-6 md:px-12 pb-12'}>
      {/* Section header */}
      <div className={`flex items-center justify-between ${compact ? 'mb-3' : 'mb-5'}`}>
        <div className="flex items-center gap-3">
          <ShoppingBag className={compact ? 'h-4 w-4' : 'h-5 w-5'} style={{ color: accentColor }} />
          <h2
            className={`${compact ? 'text-base' : 'text-xl'} font-black italic uppercase`}
            style={{ color: accentColor, textShadow: `0 0 16px ${accentColor}40` }}
          >
            Shop Online
          </h2>
        </div>

        {/* "Powered by KURB" — required attribution */}
        <a
          href={attributionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 opacity-50 hover:opacity-80 transition-opacity"
        >
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Powered by</span>
          {logoUrl ? (
            <img src={logoUrl} alt="KURB" className="h-4 w-auto object-contain" />
          ) : (
            <span className="text-[10px] font-bold text-gray-400">KURB</span>
          )}
        </a>
      </div>

      {/* Loading skeleton — count and width match the actual item display */}
      {loading && (
        <div className={`flex ${compact ? 'gap-2' : 'gap-4'} overflow-x-auto pb-2 scrollbar-none`}>
          {Array.from({ length: compact ? 4 : 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex-shrink-0 ${compact ? 'w-32' : 'w-40'} rounded-xl bg-gray-900 animate-pulse`}
              style={{ height: compact ? 190 : 220 }}
            />
          ))}
        </div>
      )}

      {/* Item cards — horizontal scroll */}
      {!loading && items.length > 0 && (
        <div className={`flex ${compact ? 'gap-2' : 'gap-3'} overflow-x-auto pb-2 scrollbar-none`}>
          {items.map(item => (
            <a
              key={item.id}
              href={item.kurb_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex-shrink-0 ${compact ? 'w-32' : 'w-40'} rounded-xl overflow-hidden border border-white/5 bg-gray-900/60 hover:border-white/20 transition-all`}
            >
              {/* Photo */}
              <div className="relative w-full aspect-square overflow-hidden bg-gray-800">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-gray-700" />
                  </div>
                )}
                {/* Condition pill — only if present */}
                {item.condition && (
                  <span className="absolute top-2 left-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-gray-300">
                    {item.condition}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5">
                {/* Brand */}
                <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5 truncate" style={{ color: accentColor, opacity: 0.8 }}>
                  {item.brand}
                </p>
                {/* Title */}
                <p className="text-white text-xs font-medium leading-snug line-clamp-2 mb-1.5">
                  {item.title}
                </p>
                {/* Bottom row: price + size (if present) */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-black text-white">
                    {formatPrice(item)}
                  </span>
                  {item.size && (
                    <span className="text-[10px] text-gray-500 border border-gray-700 rounded px-1 py-0.5 flex-shrink-0">
                      {item.size}
                    </span>
                  )}
                </div>
              </div>

              {/* Hover CTA */}
              <div className="px-2.5 pb-2.5">
                <div
                  className="w-full text-center text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1"
                  style={{ backgroundColor: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}
                >
                  <ExternalLink className="h-3 w-3" />
                  View on KURB
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* View all link — compact mode only, links to vendor's Kurb page */}
      {compact && !loading && items.length > 0 && (
        <a
          href={vendorKurbUrl ?? attributionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2.5 text-xs font-semibold transition-opacity hover:opacity-100"
          style={{ color: accentColor, opacity: 0.65 }}
        >
          View all items
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
