import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { StoreList } from '../components/store/StoreList';
import { ListViewSidebar } from '../components/filters/ListViewSidebar';
import { SortDropdown } from '../components/store/SortDropdown';
import { ScrollingBanner } from '../components/layout/ScrollingBanner';
import { MobileLocationCategoryFilters } from '../components/filters/MobileLocationCategoryFilters';
import { SEOHead, generateItemListSchema, generateBreadcrumbSchema } from '../components/seo';
import { useStores } from '../hooks/useStores';
import { Loader } from '../components/common/Loader';
import { sortStores } from '../utils/helpers';
import { CITY_NAMES_JAPANESE, CITY_COLORS, MAJOR_CITIES_JAPAN } from '../lib/constants';
import { slugToCity, slugToNeighborhood, cityToSlug, neighborhoodToSlug } from '../utils/cityData';
import type { MainCategory } from '../types/store';

export function NeighborhoodPage() {
  const { citySlug, neighborhoodSlug } = useParams<{ citySlug: string; neighborhoodSlug: string }>();
  const navigate = useNavigate();

  // Convert slugs to display names
  const cityName = useMemo(() => (citySlug ? slugToCity(citySlug) : ''), [citySlug]);
  const neighborhoodName = useMemo(() => (neighborhoodSlug ? slugToNeighborhood(neighborhoodSlug) : ''), [neighborhoodSlug]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory | null>(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('alphabetical');

  // Fetch stores for this neighborhood
  const { stores, loading } = useStores({
    countries: [],
    cities: cityName ? [cityName] : [],
    categories: [],
    priceRanges: [],
    searchQuery: '',
    selectedCity: cityName || null,
    selectedNeighborhood: neighborhoodName || null,
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

  // Handle neighborhood change - navigate to different neighborhood page
  const handleNeighborhoodChange = (neighborhood: string | null) => {
    if (!neighborhood) {
      // Navigate back to city page if "All" is selected
      navigate(`/city/${citySlug}`);
    } else {
      // Navigate to different neighborhood
      const newNeighborhoodSlug = neighborhoodToSlug(neighborhood);
      navigate(`/city/${citySlug}/${newNeighborhoodSlug}`);
    }
  };

  // Handle city change - navigate to different city page
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
    setSearchQuery('');
  };

  // Get city metadata
  const cityJapaneseName = CITY_NAMES_JAPANESE[cityName] || cityName;
  const cityColor = CITY_COLORS[cityName] || '#22D9EE';
  // Generate slug: lowercase, replace spaces with nothing, remove forward slashes
  // This matches how the image generation script processes names
  const neighborhoodImageSlug = neighborhoodName.toLowerCase().replace(/\s+/g, '').replace(/\//g, '');

  // Neighborhood hero image
  const heroImage = `/images/neighborhoods/preview/${neighborhoodImageSlug}-preview.jpg`;

  // Neighborhood description with thrifting focus
  const neighborhoodDescription = `Your complete guide to thrifting in ${neighborhoodName}, ${cityName}. Discover curated vintage stores, affordable secondhand shops, and hidden gem boutiques that make this neighborhood a must-visit for preloved fashion hunters.`;

  // Get all neighborhoods for the current city (for mobile filter)
  const allNeighborhoodsInCity = useMemo(() => {
    const unique = new Set(stores.map(s => s.neighborhood).filter(Boolean));
    return Array.from(unique).sort();
  }, [stores]);

  // Generate SEO data with guide language
  const seoTitle = `${neighborhoodName}, ${cityName} - Thrift Store & Vintage Shopping Guide 2025`;
  const seoDescription = `Explore ${stores.length} thrift stores and vintage shops in ${neighborhoodName}, ${cityName}. Complete 2025 guide to secondhand shopping, preloved fashion, affordable vintage finds, and unique boutiques in one of Japan's best thrifting neighborhoods.`;
  const seoUrl = `/city/${citySlug}/${neighborhoodSlug}`;

  // Generate structured data
  const itemListSchema = generateItemListSchema(stores, `Best Places in ${neighborhoodName}`, seoUrl);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Cities', url: '/cities' },
    { name: cityName, url: `/city/${citySlug}` },
    { name: neighborhoodName, url: seoUrl },
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
        jsonLd={[itemListSchema, breadcrumbSchema]}
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
          alt={neighborhoodName}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Neighborhood Name & Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-4 text-sm">
                <button
                  onClick={() => navigate(`/city/${citySlug}`)}
                  className="text-cyan-300 hover:text-cyan-200 transition-colors font-medium uppercase tracking-wide"
                  style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.5)' }}
                >
                  {cityName}
                </button>
                <ChevronRight className="w-4 h-4 text-cyan-400/50" />
                <span className="text-white font-bold uppercase tracking-wide">{neighborhoodName}</span>
              </div>

              {/* Neighborhood Name */}
              <h1
                className="text-6xl font-black text-white mb-2 italic uppercase"
                style={{
                  textShadow: `0 0 30px ${cityColor}80, 0 0 20px ${cityColor}60, 0 4px 12px rgba(0,0,0,0.8)`,
                  letterSpacing: '0.05em',
                }}
              >
                {neighborhoodName}
              </h1>

              {/* City Name (smaller) */}
              <div
                className="text-xl font-bold mb-4"
                style={{
                  color: cityColor,
                  textShadow: `0 0 15px ${cityColor}80, 0 2px 8px rgba(0,0,0,0.8)`,
                }}
              >
                {cityName} ({cityJapaneseName})
              </div>

              {/* Description */}
              <p className="text-gray-300 text-lg max-w-3xl leading-relaxed">
                {neighborhoodDescription}
              </p>

              {/* Store Count Badge */}
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border-2 rounded-lg"
                style={{
                  borderColor: `${cityColor}60`,
                  boxShadow: `0 0 20px ${cityColor}30`,
                }}
              >
                <MapPin className="w-5 h-5" style={{ color: cityColor }} />
                <span className="text-white font-bold">{stores.length} Places in {neighborhoodName}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Bars - MOBILE ONLY */}
      <MobileLocationCategoryFilters
        cities={MAJOR_CITIES_JAPAN}
        neighborhoods={allNeighborhoodsInCity}
        currentCity={cityName}
        currentNeighborhood={neighborhoodName}
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
            selectedNeighborhood={neighborhoodName}
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
