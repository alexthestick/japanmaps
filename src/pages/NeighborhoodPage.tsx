import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { StoreList } from '../components/store/StoreList';
import { ListViewSidebar } from '../components/filters/ListViewSidebar';
import { SortDropdown } from '../components/store/SortDropdown';
import { ScrollingBanner } from '../components/layout/ScrollingBanner';
import { useStores } from '../hooks/useStores';
import { Loader } from '../components/common/Loader';
import { sortStores } from '../utils/helpers';
import { CITY_NAMES_JAPANESE, CITY_COLORS } from '../lib/constants';
import { slugToCity, slugToNeighborhood, cityToSlug, neighborhoodToSlug } from '../utils/cityData';
import type { Store, MainCategory } from '../types/store';

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

  // Neighborhood description
  const neighborhoodDescription = `Discover the unique character of ${neighborhoodName} in ${cityName}. Explore local shops, restaurants, and hidden gems that make this neighborhood special.`;

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
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

        {/* Back Button */}
        <button
          onClick={() => navigate(`/city/${citySlug}`)}
          className="absolute top-6 left-6 z-20 bg-black/40 backdrop-blur-md border border-cyan-400/30 rounded-lg px-4 py-2 flex items-center gap-2 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-200"
          style={{
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)',
          }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold uppercase tracking-wide text-sm">Back to {cityName}</span>
        </button>

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

      {/* Main Content - List View */}
      <div className="flex min-h-screen relative">
        {/* Sidebar Filters */}
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

        {/* Store List Section */}
        <div className="flex-1 p-8 relative">
          {/* Corner decorations */}
          <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-cyan-400/30" />

          {/* Search & Sort Controls */}
          <div className="mb-6 flex gap-4 items-center relative z-10">
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
            onStoreClick={(store) => navigate(`/store/${store.id}`)}
          />
        </div>
      </div>
    </div>
  );
}
