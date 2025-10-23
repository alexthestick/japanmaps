import { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStores } from '../hooks/useStores';
import { Loader } from '../components/common/Loader';
import { StoreList } from '../components/store/StoreList';
import { CityFilterSidebar } from '../components/filters/CityFilterSidebar';
import { WashiTexture } from '../components/common/WashiTexture';
import { CITY_COORDINATES } from '../lib/constants';
// import { getCityDataWithCounts } from '../utils/cityData';
import { CITY_COLORS } from '../lib/constants';
import { slugToCity } from '../utils/cityData';
import { motion } from 'framer-motion';
// import { useReducedMotion } from '../motion';

export function CityPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    mainCategories: [] as string[],
    subcategories: [] as string[],
  });

  const cityName = useMemo(() => (slug ? slugToCity(slug) : ''), [slug]);

  // Build filters for this city
  const { stores, loading, error } = useStores({
    cities: cityName ? [cityName] : [],
    countries: [],
    mainCategories: filters.mainCategories.length > 0 ? filters.mainCategories : [],
    categories: filters.subcategories.length > 0 ? filters.subcategories : [],
    priceRanges: [],
    searchQuery: '',
    selectedCity: cityName,
    selectedNeighborhood: null,
    selectedCategory: null,
  } as any);

  const cityColor = CITY_COLORS[cityName] || '#111827';
  // const coords = CITY_COORDINATES[cityName] || CITY_COORDINATES.Tokyo;
  // const prefersReducedMotion = useReducedMotion();

  // Shinkansen streak overlay on mount
  const [showStreak, setShowStreak] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowStreak(false), 350);
    return () => clearTimeout(t);
  }, []);

  if (!slug) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader message="Loading city..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading City</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const storeCount = stores.length;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <CityFilterSidebar
        selectedFilters={filters}
        onFilterChange={setFilters}
      />

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Bullet train streak overlay */}
        {showStreak && (
          <div
            className="pointer-events-none fixed inset-0 animate-streak"
            style={{
              background: `linear-gradient(90deg, transparent, ${cityColor}, transparent)`,
            }}
          />
        )}
        {/* Hero */}
        <div className="relative h-[40vh] md:h-[50vh] bg-gray-900 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          layoutId={`city-image-${cityName}`}
          style={{ background: `linear-gradient(135deg, ${cityColor} 0%, rgba(0,0,0,0.6) 100%)` }}
        />
        <WashiTexture opacity={0.06} />
        <div className="relative max-w-7xl mx-auto h-full px-6 flex flex-col justify-end pb-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
              {cityName}
            </h1>
            <p className="mt-3 text-gray-200 uppercase tracking-wider text-sm">
              {storeCount} {storeCount === 1 ? 'Store' : 'Stores'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/map?city=${encodeURIComponent(cityName)}&view=map`)}
                className="px-5 py-2.5 bg-white text-gray-900 rounded-md font-semibold hover:bg-gray-100 transition"
              >
                Open on Map
              </button>
              <button
                onClick={() => navigate(`/map?city=${encodeURIComponent(cityName)}&view=list`)}
                className="px-5 py-2.5 bg-white/10 text-white rounded-md font-semibold hover:bg-white/20 transition border border-white/20"
              >
                Browse List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-8 py-10">
        <WashiTexture opacity={0.03} />
        {storeCount === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No stores yet</h3>
            <p className="text-gray-600 mb-6">We haven't added spots in {cityName} yet. Explore the map to browse other cities.</p>
            <button
              onClick={() => navigate('/map?view=map')}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-md font-semibold hover:bg-gray-800 transition"
            >
              Explore the Map
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Top Spots</h2>
              <Link
                to={`/map?city=${encodeURIComponent(cityName)}&view=list`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                See all
              </Link>
            </div>
            <StoreList
              stores={stores}
              onStoreClick={(store) => navigate(`/store/${store.id}`, { state: { from: `/city/${slug}` } })}
            />
          </>
        )}
      </div>
      </div>
    </div>
  );
}


