import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapView } from '../components/map/MapView';
import { StoreList } from '../components/store/StoreList';
import { StoreDetail } from '../components/store/StoreDetail';
// import { StoreDetailModal } from '../components/store/StoreDetailModal'; // Not needed in new design
import { FloatingSearchBar } from '../components/map/FloatingSearchBar';
import { FloatingCategoryPanel } from '../components/map/FloatingCategoryPanel';
import { FloatingMapLegend } from '../components/map/FloatingMapLegend';
import { ViewToggleButton } from '../components/map/ViewToggleButton';
import { ListViewSidebar } from '../components/filters/ListViewSidebar';
import { SortDropdown } from '../components/store/SortDropdown';
import { useStores } from '../hooks/useStores';
import { Loader } from '../components/common/Loader';
import type { Store, MainCategory } from '../types/store';
import { sortStores } from '../utils/helpers';
import { getCityDataWithCounts, type CityData } from '../utils/cityData';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // View state (persist in URL)
  const initialView = (searchParams.get('view') as 'map' | 'list') || 'map';
  const [view, setView] = useState<'map' | 'list'>(initialView);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [sortBy, setSortBy] = useState<string>(() => {
    // Only randomize on first page load, never again
    return 'random';
  });
  const sortByRef = useRef(true); // Track if we've already done the initial random sort
  // City data no longer needed in this view
  // const [cities, setCities] = useState<CityData[]>([]);
  // useEffect(() => {
  //   getCityDataWithCounts().then(setCities);
  // }, []);

  // Filter state from URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory | null>(
    (searchParams.get('category') as MainCategory) || null
  );
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    searchParams.get('styles')?.split(',').filter(Boolean) || []
  );
  const [selectedCity, setSelectedCity] = useState<string | null>(
    searchParams.get('city') || null
  );
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(
    searchParams.get('neighborhood') || null
  );

  // Debounce timer for URL updates
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Sync URL params to state when URL changes (e.g., from Cities menu navigation)
  useEffect(() => {
    const viewFromUrl = (searchParams.get('view') as 'map' | 'list') || 'map';
    const cityFromUrl = searchParams.get('city');
    const categoryFromUrl = searchParams.get('category') as MainCategory | null;
    const stylesFromUrl = searchParams.get('styles')?.split(',').filter(Boolean) || [];
    const searchFromUrl = searchParams.get('search') || '';
    const neighborhoodFromUrl = searchParams.get('neighborhood');

    // Update state if URL params differ (external navigation)
    if (viewFromUrl !== view) setView(viewFromUrl);
    if (cityFromUrl !== selectedCity) setSelectedCity(cityFromUrl);
    if (categoryFromUrl !== selectedMainCategory) setSelectedMainCategory(categoryFromUrl);
    if (searchFromUrl !== searchQuery) setSearchQuery(searchFromUrl);
    if (neighborhoodFromUrl !== selectedNeighborhood) setSelectedNeighborhood(neighborhoodFromUrl);

    const stylesChanged = JSON.stringify(stylesFromUrl) !== JSON.stringify(selectedSubCategories);
    if (stylesChanged) setSelectedSubCategories(stylesFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only depend on searchParams

  // Update URL when filters/view change (debounced for search, immediate for others)
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce URL updates by 500ms
    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams();

      params.set('view', view);
      if (searchQuery) params.set('search', searchQuery);
      if (selectedMainCategory) params.set('category', selectedMainCategory);
      if (selectedSubCategories.length > 0) params.set('styles', selectedSubCategories.join(','));
      if (selectedCity) params.set('city', selectedCity);
      if (selectedNeighborhood) params.set('neighborhood', selectedNeighborhood);

      setSearchParams(params, { replace: true });
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [view, searchQuery, selectedMainCategory, selectedSubCategories, selectedCity, selectedNeighborhood, setSearchParams]);

  // Memoize filters object to prevent unnecessary re-fetches
  const storeFilters = useMemo(() => ({
    countries: [],
    cities: selectedCity ? [selectedCity] : [],
    categories: selectedSubCategories.length > 0 ? selectedSubCategories as any : [],
    priceRanges: [],
    searchQuery,
    selectedCity,
    selectedNeighborhood,
    selectedCategory: selectedSubCategories[0] || null,
  }), [selectedCity, selectedSubCategories, searchQuery, selectedNeighborhood]);

  // Fetch stores with filters
  const { stores, loading, error } = useStores(storeFilters);

  // Filter stores by main category and city (client-side)
  const filteredStores = stores.filter(store => {
    // Filter by main category if selected
    if (selectedMainCategory && store.mainCategory !== selectedMainCategory) {
      return false;
    }
    // Filter by city if selected (double-check from backend)
    if (selectedCity && store.city !== selectedCity) {
      return false;
    }
    return true;
  });

  // Sort stores - only randomize on initial load, then keep the sort option selected
  const sortedStores = useMemo(() => {
    // If this is the first load and sortBy is 'random', do the random sort
    // Then never randomize again automatically
    if (sortByRef.current && sortBy === 'random') {
      sortByRef.current = false; // Mark that we've done the initial randomization
      return sortStores(filteredStores, sortBy);
    }

    // For all other cases, if sortBy is 'random', don't reshuffle - keep current order
    if (sortBy === 'random') {
      return filteredStores; // Just return as-is, don't reshuffle
    }

    // For other sort options, apply them normally
    return sortStores(filteredStores, sortBy);
  }, [filteredStores, sortBy]);

  // Filter handlers
  const handleMainCategoryChange = (category: MainCategory | null) => {
    setSelectedMainCategory(category);
    // Clear sub-categories when changing main category
    if (category !== 'Fashion') {
      setSelectedSubCategories([]);
    }
  };

  const handleSubCategoryToggle = (category: string) => {
    setSelectedSubCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCityChange = (city: string | null) => {
    setSelectedCity(city);
    if (!city) setSelectedNeighborhood(null); // Clear neighborhood when city cleared
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedMainCategory(null);
    setSelectedSubCategories([]);
    setSelectedCity(null);
    setSelectedNeighborhood(null);
  };

  // const hasActiveFilters = selectedMainCategory || selectedSubCategories.length > 0 || selectedCity || searchQuery;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader message="Loading stores..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Stores</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {view === 'map' ? (
        // ========== MAP VIEW - Full Screen with Floating Panels ==========
        <div className="relative w-full h-[calc(100vh-64px)]">
          {/* Full-screen Map */}
          <MapView
            stores={filteredStores}
            onStoreClick={setSelectedStore}
            selectedCity={selectedCity}
            selectedNeighborhood={selectedNeighborhood}
            activeMainCategory={selectedMainCategory}
            activeSubCategory={selectedSubCategories[0] || null}
          />

          {/* Floating Search Bar */}
          <FloatingSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search stores, neighborhoods..."
          />

          {/* Floating Category Panel */}
          <FloatingCategoryPanel
            selectedMainCategory={selectedMainCategory}
            selectedSubCategories={selectedSubCategories}
            selectedCity={selectedCity}
            selectedNeighborhood={selectedNeighborhood}
            onMainCategoryChange={handleMainCategoryChange}
            onSubCategoryToggle={handleSubCategoryToggle}
            onCityChange={handleCityChange}
            onNeighborhoodChange={setSelectedNeighborhood}
          />

          {/* Floating Map Legend */}
          <FloatingMapLegend />

          {/* View Toggle Button */}
          <ViewToggleButton
            currentView="map"
            onToggle={(newView) => setView(newView)}
          />

          {/* Store Detail Panel */}
          {selectedStore && (
            <StoreDetail
              store={selectedStore}
              onClose={() => setSelectedStore(null)}
            />
          )}
        </div>
      ) : (
        // ========== LIST VIEW - Sidebar + Grid Layout ==========
        <div className="flex min-h-screen bg-white">
          {/* Left Sidebar */}
          <ListViewSidebar
            selectedMainCategory={selectedMainCategory}
            selectedCity={selectedCity}
            onMainCategoryChange={handleMainCategoryChange}
            onCityChange={handleCityChange}
            onClearAll={handleClearAll}
          />

          {/* Main Content Area */}
          <div className="flex-1 p-8 bg-gray-50">
            {/* Header Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{sortedStores.length}</span> stores
              </div>
              <div className="flex items-center gap-3">
                <SortDropdown value={sortBy} onChange={setSortBy} />
                <button
                  onClick={() => setView('map')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Map View
                </button>
              </div>
            </div>

            {/* Store List */}
            <StoreList
              stores={sortedStores}
              onStoreClick={(store) => {
                const params = Object.fromEntries(searchParams.entries());
                navigate(`/store/${store.id}`, { state: { from: '/map', params } });
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
