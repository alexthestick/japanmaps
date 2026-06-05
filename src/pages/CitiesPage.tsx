import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '../components/seo';
import { MAJOR_CITIES_JAPAN, CITY_NAMES_JAPANESE, CITY_REGIONS } from '../lib/constants';
import { cityToSlug } from '../utils/cityData';
import { supabase } from '../lib/supabase';

// ─── Priority order ──────────────────────────────────────────────────────────
// Hard-coded by known store density — Tokyo has the most, then Osaka, etc.
// This avoids depending on dynamic counts which are keyed by neighborhood.
const CITY_PRIORITY: Record<string, number> = {
  'Tokyo': 1,
  'Osaka': 2,
  'Kyoto': 3,
  'Fukuoka': 4,
  'Nagoya': 5,
  'Sapporo': 6,
  'Kanagawa / Yokohama': 7,
  'Kobe': 8,
  'Hiroshima': 9,
  'Kanazawa': 10,
  'Sendai': 11,
  'Okayama': 12,
  'Niigata': 13,
  'Chiba': 14,
  'Kawasaki': 15,
};

const SORTED_CITIES = [...MAJOR_CITIES_JAPAN].sort((a, b) => {
  const pa = CITY_PRIORITY[a] ?? 99;
  const pb = CITY_PRIORITY[b] ?? 99;
  return pa - pb;
});

// ─── City card ───────────────────────────────────────────────────────────────
interface CityCardProps {
  city: string;
  photoUrl: string | null;
  storeCount: number;
}

function CityCard({ city, photoUrl, storeCount }: CityCardProps) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const jpName = CITY_NAMES_JAPANESE[city] || '';
  const region = CITY_REGIONS[city] || 'Japan';
  const slug = cityToSlug(city);

  const showPhoto = photoUrl && !imgError;

  return (
    <button
      onClick={() => navigate(`/city/${slug}`)}
      className="relative w-full overflow-hidden rounded-xl group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-[0.98] transition-transform duration-150"
      style={{ aspectRatio: '4/3' }}
      aria-label={`Explore ${city}`}
    >
      {/* Photo or gradient fallback */}
      {showPhoto ? (
        <img
          src={photoUrl}
          alt={city}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

      {/* Hover border glow — opacity only, compositor-safe */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-white/10 group-hover:ring-cyan-400/50 transition-all duration-300" />

      {/* Top row: region + store count */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/60 bg-black/40 backdrop-blur-sm rounded-full border border-white/10">
          {region}
        </span>
        {storeCount > 0 && (
          <span className="px-2 py-0.5 text-[10px] font-bold text-cyan-300 bg-black/40 backdrop-blur-sm rounded-full border border-cyan-400/30">
            {storeCount} stores
          </span>
        )}
      </div>

      {/* Bottom: city name */}
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
        <h2
          className="font-black italic text-white text-lg md:text-2xl leading-none tracking-tight"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
        >
          {city}
        </h2>
        {jpName && (
          <p className="text-white/45 text-xs mt-0.5 font-medium">{jpName}</p>
        )}
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function CitiesPage() {
  // cityPhotos: city name → best photo URL from a real store in that city
  const [cityPhotos, setCityPhotos] = useState<Record<string, string>>({});
  // cityCounts: city name → store count from DB
  const [cityCounts, setCityCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCityData() {
      try {
        // Single query: fetch stores ordered by save_count descending.
        // We take the first photo we find for each city — highest-saved
        // stores surface first so city cards show their most popular content.
        const { data, error } = await supabase
          .from('stores')
          .select('city, photos')
          .not('photos', 'is', null)
          .order('save_count', { ascending: false })
          .limit(500);

        if (error) throw error;

        // Also fetch store counts grouped by city
        const { data: countData } = await supabase
          .from('stores')
          .select('city');

        const photos: Record<string, string> = {};
        const counts: Record<string, number> = {};

        // Build count map
        if (countData) {
          for (const row of countData) {
            if (row.city) {
              counts[row.city] = (counts[row.city] || 0) + 1;
            }
          }
        }

        // Build photo map — first non-empty photo per city wins
        if (data) {
          for (const row of data) {
            if (
              row.city &&
              !photos[row.city] &&
              Array.isArray(row.photos) &&
              row.photos.length > 0 &&
              row.photos[0]
            ) {
              photos[row.city] = row.photos[0];
            }
          }
        }

        setCityPhotos(photos);
        setCityCounts(counts);
      } catch (err) {
        console.error('CitiesPage: failed to fetch city data', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCityData();
  }, []);

  const totalStores = Object.values(cityCounts).reduce((a, b) => a + b, 0);

  return (
    <>
      <SEOHead
        title="Cities — Lost in Transit JP"
        description="Explore vintage, archive, and streetwear stores across Tokyo, Osaka, Kyoto, Fukuoka, and 20+ more Japanese cities."
        url="/cities"
      />

      <div className="min-h-dvh bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white">
        {/* Subtle film grain */}
        <div className="fixed inset-0 film-grain opacity-[0.03] pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">

          {/* Header */}
          <div className="mb-8 md:mb-10">
            <h1
              className="text-5xl md:text-7xl font-black italic uppercase tracking-tight text-white leading-none mb-2"
              style={{ textShadow: '0 0 40px rgba(34, 217, 238, 0.25)' }}
            >
              CITIES
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              {loading ? (
                <span className="text-gray-700">Loading...</span>
              ) : (
                <>{totalStores.toLocaleString()} stores across {MAJOR_CITIES_JAPAN.length} Japanese cities</>
              )}
            </p>
          </div>

          {/* Equal grid — 2 cols mobile, 3 cols desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {SORTED_CITIES.map((city) => (
              <CityCard
                key={city}
                city={city}
                photoUrl={cityPhotos[city] || null}
                storeCount={cityCounts[city] || 0}
              />
            ))}
          </div>

          <p className="mt-10 text-center text-xs text-gray-700">
            More cities added as we discover new stores across Japan.
          </p>
        </div>
      </div>
    </>
  );
}
