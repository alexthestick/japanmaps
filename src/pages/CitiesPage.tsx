import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '../components/seo';
import { MAJOR_CITIES_JAPAN, CITY_NAMES_JAPANESE, CITY_REGIONS } from '../lib/constants';
import { getNeighborhoodStoreCounts } from '../utils/neighborhoodData';
import { cityToSlug } from '../utils/cityData';

// Curated city photos — stored locally in /images/cities/preview/
// Falls back to a gradient placeholder if the image hasn't been added yet
const CITY_IMAGES: Record<string, string> = {
  'Tokyo': '/images/cities/preview/tokyo1-preview.jpg',
  'Osaka': '/images/cities/preview/osaka-preview.jpg',
  'Kyoto': '/images/cities/preview/kyoto-preview.jpg',
  'Fukuoka': '/images/cities/preview/fukuoka-preview.jpg',
  'Nagoya': '/images/cities/preview/nagoya-preview.jpg',
  'Sapporo': '/images/cities/preview/sapporo-preview.jpg',
  'Kanagawa / Yokohama': '/images/cities/preview/yokohama-preview.jpg',
  'Hiroshima': '/images/cities/preview/hiroshima-preview.jpg',
  'Kanazawa': '/images/cities/preview/kanazawa-preview.jpg',
  'Kobe': '/images/cities/preview/kobe-preview.jpg',
};

// Gradient fallbacks for cities without photos yet
const FALLBACK_GRADIENT: Record<string, string> = {
  'Tokyo': 'linear-gradient(135deg, #0a0a1f 0%, #0d2b45 100%)',
  'Osaka': 'linear-gradient(135deg, #1a0a00 0%, #3d1f0d 100%)',
  'Kyoto': 'linear-gradient(135deg, #001a0a 0%, #0d3d2a 100%)',
  'Fukuoka': 'linear-gradient(135deg, #0a001a 0%, #2a1a3d 100%)',
  'Nagoya': 'linear-gradient(135deg, #1a1a00 0%, #3d3a0d 100%)',
  'Sapporo': 'linear-gradient(135deg, #001a1a 0%, #0d3d3d 100%)',
};

function getFallback(city: string): string {
  return FALLBACK_GRADIENT[city] || 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)';
}

interface CityCardProps {
  city: string;
  storeCount: number;
  isHero?: boolean;
}

function CityCard({ city, storeCount, isHero = false }: CityCardProps) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const jpName = CITY_NAMES_JAPANESE[city] || '';
  const region = CITY_REGIONS[city] || 'Japan';
  const imgSrc = CITY_IMAGES[city];
  const slug = cityToSlug(city);

  return (
    <button
      onClick={() => navigate(`/city/${slug}`)}
      className="relative w-full overflow-hidden rounded-xl group cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      style={{ aspectRatio: isHero ? '21/9' : '4/3' }}
      aria-label={`Explore ${city}`}
    >
      {/* Photo or gradient */}
      {imgSrc && !imgError ? (
        <img
          src={imgSrc}
          alt={city}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-active:scale-100"
          loading={isHero ? 'eager' : 'lazy'}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: getFallback(city) }}
        />
      )}

      {/* Gradient overlay — darker at bottom for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5 transition-opacity duration-300 group-hover:from-black/70" />

      {/* Neon border glow on hover — compositor safe (opacity only) */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-cyan-400/20 group-hover:ring-cyan-400/60 transition-all duration-300" />

      {/* Region badge */}
      <div className="absolute top-3 left-3">
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/70 bg-black/40 backdrop-blur-sm rounded-full border border-white/10">
          {region}
        </span>
      </div>

      {/* Store count badge */}
      {storeCount > 0 && (
        <div className="absolute top-3 right-3">
          <span
            className="px-2 py-0.5 text-[10px] font-bold text-white bg-black/40 backdrop-blur-sm rounded-full border border-cyan-400/30"
            style={{ textShadow: '0 0 8px rgba(34, 217, 238, 0.5)' }}
          >
            {storeCount} stores
          </span>
        </div>
      )}

      {/* City name */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2
              className={`font-black italic text-white leading-none tracking-tight ${isHero ? 'text-4xl md:text-6xl' : 'text-xl md:text-2xl'}`}
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(34, 217, 238, 0.2)' }}
            >
              {city}
            </h2>
            {jpName && (
              <p className={`text-white/50 font-medium mt-0.5 ${isHero ? 'text-lg' : 'text-xs'}`}>
                {jpName}
              </p>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function CitiesPage() {
  const [storeCounts, setStoreCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNeighborhoodStoreCounts().then((counts) => {
      setStoreCounts(counts);
      setLoading(false);
    });
  }, []);

  // Sort cities by store count descending so most-active cities surface first
  const sortedCities = [...MAJOR_CITIES_JAPAN].sort(
    (a, b) => (storeCounts.get(b) || 0) - (storeCounts.get(a) || 0)
  );

  const heroCityName = sortedCities[0]; // Always the city with the most stores
  const gridCities = sortedCities.slice(1);

  const totalStores = [...storeCounts.values()].reduce((a, b) => a + b, 0);

  return (
    <>
      <SEOHead
        title="Cities — Lost in Transit JP"
        description="Explore vintage, archive, and streetwear stores across Tokyo, Osaka, Kyoto, Fukuoka, and 20+ more Japanese cities."
        url="/cities"
      />

      <div className="min-h-dvh bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white">
        {/* Film grain */}
        <div className="fixed inset-0 film-grain opacity-[0.03] pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">

          {/* Page header */}
          <div className="mb-8 md:mb-10">
            <h1
              className="text-5xl md:text-7xl font-black italic uppercase tracking-tight text-white leading-none mb-2"
              style={{ textShadow: '0 0 40px rgba(34, 217, 238, 0.3)' }}
            >
              CITIES
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              {loading ? (
                <span className="text-gray-600 animate-pulse">Loading store counts...</span>
              ) : (
                <>{totalStores.toLocaleString()} stores across {MAJOR_CITIES_JAPAN.length} Japanese cities</>
              )}
            </p>
          </div>

          {/* Hero city — full width */}
          {heroCityName && (
            <div className="mb-3">
              <CityCard
                city={heroCityName}
                storeCount={storeCounts.get(heroCityName) || 0}
                isHero
              />
            </div>
          )}

          {/* City grid — 2 cols mobile, 3 cols desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gridCities.map((city) => (
              <CityCard
                key={city}
                city={city}
                storeCount={storeCounts.get(city) || 0}
              />
            ))}
          </div>

          {/* Footer note */}
          <p className="mt-8 text-center text-xs text-gray-600">
            More cities added regularly as we discover new stores.
          </p>
        </div>
      </div>
    </>
  );
}
