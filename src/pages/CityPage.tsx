import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { StoreList } from '../components/store/StoreList';
import { ListViewSidebar } from '../components/filters/ListViewSidebar';
import { SortDropdown } from '../components/store/SortDropdown';
import { StoreDetail } from '../components/store/StoreDetail';
import { ScrollingBanner } from '../components/layout/ScrollingBanner';
import { MobileLocationCategoryFilters } from '../components/filters/MobileLocationCategoryFilters';
import { SEOHead, generateCitySchema, generateItemListSchema, generateBreadcrumbSchema } from '../components/seo';
import { useStores } from '../hooks/useStores';
import { Loader } from '../components/common/Loader';
import { sortStores } from '../utils/helpers';
import { CITY_NAMES_JAPANESE, CITY_COLORS, MAJOR_CITIES_JAPAN } from '../lib/constants';
import { slugToCity, cityToSlug, neighborhoodToSlug } from '../utils/cityData';
import type { MainCategory } from '../types/store';

export function CityPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Convert slug to city name
  const cityName = useMemo(() => (slug ? slugToCity(slug) : ''), [slug]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory | null>(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('alphabetical');

  // Fetch stores for this city
  const { stores, loading } = useStores({
    countries: [],
    cities: cityName ? [cityName] : [],
    categories: [],
    priceRanges: [],
    searchQuery: '',
    selectedCity: cityName || null,
    selectedNeighborhood: null,
    selectedCategory: null,
  });

  // Filter stores based on selected filters
  const filteredStores = stores.filter((store) => {
    // Search query
    if (searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Main category
    if (selectedMainCategory && store.mainCategory !== selectedMainCategory) {
      return false;
    }

    // Sub-categories
    if (selectedSubCategories.length > 0) {
      const hasMatchingCategory = store.categories.some((cat) =>
        selectedSubCategories.includes(cat)
      );
      if (!hasMatchingCategory) return false;
    }

    // Neighborhood (case-insensitive matching)
    if (selectedNeighborhood) {
      if (!store.neighborhood) return false;
      const normalizedFilter = selectedNeighborhood.toLowerCase().replace(/[-\s]/g, '');
      const normalizedNeighborhood = store.neighborhood.toLowerCase().replace(/[-\s]/g, '');
      if (normalizedNeighborhood !== normalizedFilter) return false;
    }

    return true;
  });

  // Sort stores
  const sortedStores = sortStores(filteredStores, sortBy);

  // Handle filter changes
  const handleMainCategoryChange = (category: MainCategory | null) => {
    setSelectedMainCategory(category);
    if (category !== selectedMainCategory) {
      setSelectedSubCategories([]);
    }
  };

  const handleSubCategoryToggle = (subCategory: string) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subCategory)
        ? prev.filter((cat) => cat !== subCategory)
        : [...prev, subCategory]
    );
  };

  const handleNeighborhoodChange = (neighborhood: string | null) => {
    if (!neighborhood) {
      // Stay on city page if "All" is selected
      setSelectedNeighborhood(null);
    } else {
      // Navigate to neighborhood page
      const neighborhoodSlug = neighborhoodToSlug(neighborhood);
      navigate(`/city/${slug}/${neighborhoodSlug}`);
    }
  };

  const handleCityChange = (city: string | null) => {
    if (!city) {
      // Navigate to main map list view
      navigate('/map?view=list');
    } else {
      // Navigate to different city
      const newCitySlug = cityToSlug(city);
      navigate(`/city/${newCitySlug}`);
    }
  };

  const handleClearAll = () => {
    setSelectedMainCategory(null);
    setSelectedSubCategories([]);
    setSelectedNeighborhood(null);
    setSearchQuery('');
  };

  // Get city metadata
  const cityJapaneseName = CITY_NAMES_JAPANESE[cityName] || cityName;
  const cityColor = CITY_COLORS[cityName] || '#22D9EE';
  const cityImageSlug = cityName.toLowerCase().replace(/\s+/g, '').replace(/\//g, '');

  // City hero image mapping (handle special cases)
  const getCityHeroImage = (slug: string): string => {
    const imageMap: Record<string, string> = {
      'kanagawayokohama': 'yokohama',
      'tokyo': 'tokyo1',
      'osaka': 'fukuoka', // Fallback until osaka image is added
      'nagoya': 'fukuoka', // Fallback until nagoya image is added
      'atsugi': 'fukuoka', // Fallback
      'toyama': 'fukuoka', // Fallback
    };
    return `/images/cities/preview/${imageMap[slug] || slug}-preview.jpg`;
  };

  const heroImage = getCityHeroImage(cityImageSlug);

  // City description/history - can be expanded later
  const cityDescription = `Explore the best stores, restaurants, and hidden gems in ${cityName}. From traditional neighborhoods to modern shopping districts, discover what makes ${cityName} unique.`;

  // Get unique neighborhoods from stores
  const neighborhoods = useMemo(() => {
    const unique = new Set(stores.map(s => s.neighborhood).filter(Boolean));
    return Array.from(unique).sort();
  }, [stores]);

  // Generate SEO data
  const seoTitle = `${cityName} (${cityJapaneseName}) - Best Stores & Hidden Gems`;
  const seoDescription = `Explore ${stores.length} curated stores, restaurants, coffee shops, and hidden gems in ${cityName}, Japan. Your guide to the best of ${cityJapaneseName}.`;
  const seoUrl = `/city/${slug}`;

  // Generate structured data
  const citySchema = generateCitySchema(cityName, slug || '', stores.length);
  const itemListSchema = generateItemListSchema(stores, `Best Places in ${cityName}`, seoUrl);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Cities', url: '/cities' },
    { name: cityName, url: seoUrl },
  ]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* SEO Head */}
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        image={heroImage}
        url={seoUrl}
        jsonLd={[citySchema, itemListSchema, breadcrumbSchema]}
      />

      {/* Film grain overlay */}
      <div className="fixed inset-0 film-grain opacity-20 pointer-events-none" />

      {/* Scrolling Banner */}
      <ScrollingBanner />

      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden border-b-2 border-cyan-400/30">
        {/* Hero Image */}
        <img
          src={heroImage}
          alt={cityName}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* City Name & Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* City Name */}
              <h1
                className="text-6xl font-black text-white mb-2 italic uppercase"
                style={{
                  textShadow: `0 0 30px ${cityColor}80, 0 0 20px ${cityColor}60, 0 4px 12px rgba(0,0,0,0.8)`,
                  letterSpacing: '0.05em',
                }}
              >
                {cityName}
              </h1>

              {/* Japanese Name */}
              <div
                className="text-2xl font-bold mb-4"
                style={{
                  color: cityColor,
                  textShadow: `0 0 15px ${cityColor}80, 0 2px 8px rgba(0,0,0,0.8)`,
                }}
              >
                {cityJapaneseName}
              </div>

              {/* Description */}
              <p className="text-gray-300 text-lg max-w-3xl leading-relaxed">
                {cityDescription}
              </p>

              {/* Store Count Badge */}
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border-2 rounded-lg"
                style={{
                  borderColor: `${cityColor}60`,
                  boxShadow: `0 0 20px ${cityColor}30`,
                }}
              >
                <MapPin className="w-5 h-5" style={{ color: cityColor }} />
                <span className="text-white font-bold">{stores.length} Places</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* SEO: Top Stores Section - crawlable links for Google */}
      {stores.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 border-b border-cyan-400/20">
          <h2
            className="text-xl font-black italic uppercase mb-4"
            style={{ color: cityColor, textShadow: `0 0 20px ${cityColor}50` }}
          >
            Top Stores in {cityName}
          </h2>
          <div className="flex flex-wrap gap-2">
            {stores.slice(0, 20).map((store) => (
              <Link
                key={store.id}
                to={`/store/${store.slug || store.id}`}
                className="px-3 py-1.5 bg-gray-800/60 text-gray-300 text-sm rounded-full border border-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-300 transition-all"
              >
                {store.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* SEO: Explore Neighborhoods - crawlable links */}
      {neighborhoods.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 border-b border-cyan-400/20">
          <h2
            className="text-xl font-black italic uppercase mb-4"
            style={{ color: cityColor, textShadow: `0 0 20px ${cityColor}50` }}
          >
            Neighborhoods in {cityName}
          </h2>
          <div className="flex flex-wrap gap-2">
            {neighborhoods.map((hood) => (
              <Link
                key={hood}
                to={`/city/${slug}/${neighborhoodToSlug(hood!)}`}
                className="px-4 py-2 bg-gray-800/60 text-gray-300 text-sm font-medium rounded-full border border-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-300 transition-all"
              >
                {hood}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Filter Bars - MOBILE ONLY */}
      <MobileLocationCategoryFilters
        cities={MAJOR_CITIES_JAPAN}
        neighborhoods={neighborhoods}
        currentCity={cityName}
        currentNeighborhood={null}
        selectedCategory={selectedMainCategory}
        onCityChange={handleCityChange}
        onNeighborhoodChange={handleNeighborhoodChange}
        onCategoryChange={handleMainCategoryChange}
        cityColor={cityColor}
      />

      {/* Main Content - List View */}
      <div className="flex min-h-screen relative">
        {/* Sidebar Filters - DESKTOP ONLY */}
        <div className="hidden md:block">
          <ListViewSidebar
            selectedMainCategory={selectedMainCategory}
            selectedSubCategories={selectedSubCategories}
            selectedCity={cityName}
            selectedNeighborhood={selectedNeighborhood}
            onMainCategoryChange={handleMainCategoryChange}
            onSubCategoryToggle={handleSubCategoryToggle}
            onCityChange={handleCityChange}
            onNeighborhoodChange={handleNeighborhoodChange}
            onClearAll={handleClearAll}
          />
        </div>

        {/* Store List Section */}
        <div className="flex-1 p-4 md:p-8 relative">
          {/* Corner decorations */}
          <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-cyan-400/30" />

          {/* Search & Sort Controls - DESKTOP ONLY */}
          <div className="hidden md:flex mb-6 gap-4 items-center relative z-10">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border-2 border-cyan-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/60 transition-all"
                style={{
                  boxShadow: '0 0 15px rgba(34, 217, 238, 0.1)',
                }}
              />
            </div>

            {/* Sort Dropdown */}
            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-400">
            Showing <span className="text-cyan-300 font-bold">{sortedStores.length}</span> of{' '}
            <span className="text-white font-bold">{stores.length}</span> places
          </div>

          {/* Store Grid */}
          <StoreList
            stores={sortedStores}
            loading={loading}
            onStoreClick={(store) => navigate(`/store/${store.slug || store.id}`)}
          />
        </div>
      </div>
    </div>
  );
}


