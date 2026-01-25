import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Dices } from 'lucide-react';
import { MapView } from '../components/map/MapView';
import { StoreList } from '../components/store/StoreList';
import { StoreDetail } from '../components/store/StoreDetail';
import { ScrollingBanner } from '../components/layout/ScrollingBanner';
// import { StoreDetailModal } from '../components/store/StoreDetailModal'; // Not needed in new design
import { FloatingSearchBar } from '../components/map/FloatingSearchBar';
import { FloatingCategoryPanel } from '../components/map/FloatingCategoryPanel';
import { FloatingMapLegend } from '../components/map/FloatingMapLegend';
import { ViewToggleButton } from '../components/map/ViewToggleButton';
import { MobileFilterBar } from '../components/map/MobileFilterBar';
import { MobileListView } from '../components/mobile/MobileListView';
import { ListViewSidebar } from '../components/filters/ListViewSidebar';
import { SortDropdown } from '../components/store/SortDropdown';
import { BottomSheet } from '../components/common/BottomSheet';
import { RandomStoreModal } from '../components/store/RandomStoreModal';
import { useStores } from '../hooks/useStores';
import { useIsMobile } from '../hooks/useMediaQuery';
import { Loader } from '../components/common/Loader';
import type { Store, MainCategory } from '../types/store';
import { sortStores } from '../utils/helpers';
import { getCityDataWithCounts, type CityData } from '../utils/cityData';
import type { SearchSuggestion } from '../components/store/SearchAutocomplete';
import { MAJOR_CITIES_JAPAN, LOCATIONS } from '../lib/constants';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // View state (persist in URL)
  const initialView = (searchParams.get('view') as 'map' | 'list') || 'map';
  const [view, setView] = useState<'map' | 'list'>(initialView);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [sortBy, setSortBy] = useState<string>('alphabetical');
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

  // Mobile state
  const [showCityDrawer, setShowCityDrawer] = useState(false);
  const [tappedStoreId, setTappedStoreId] = useState<string | null>(null); // Track first tap on mobile
  const isMobile = useIsMobile();

  // Random store modal state (for list view)
  const [randomStore, setRandomStore] = useState<Store | null>(null);

  // Map style mode state
  const getInitialStyleMode = (): 'day' | 'night' => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('map-style-mode') : null;
      if (saved === 'day' || saved === 'night') return saved;
      const hour = new Date().getHours();
      return hour >= 18 || hour < 6 ? 'night' : 'day';
    } catch {
      return 'day';
    }
  };
  const [mapStyleMode, setMapStyleMode] = useState<'day' | 'night'>(getInitialStyleMode);

  // Persist map style mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('map-style-mode', mapStyleMode);
    } catch {}
  }, [mapStyleMode]);

  // Refs for map control and preventing refresh
  const mapViewRef = useRef<any>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Handle store clicks with two-tap behavior on mobile
  const handleStoreClick = useCallback((store: Store) => {
    if (isMobile) {
      // Mobile: Two-tap behavior
      if (tappedStoreId === store.id) {
        // Second tap on same store - open detail panel
        setSelectedStore(store);
        setTappedStoreId(null);
      } else {
        // First tap - just show store name label, don't open panel
        setTappedStoreId(store.id);
        // Clear the tapped state after 3 seconds if no second tap
        setTimeout(() => {
          setTappedStoreId(prev => prev === store.id ? null : prev);
        }, 3000);
      }
    } else {
      // Desktop: Single click opens detail panel immediately
      setSelectedStore(store);
    }
  }, [isMobile, tappedStoreId]);

  // Handle label clicks - opens detail panel directly
  const handleLabelClick = useCallback((store: Store) => {
    setSelectedStore(store);
    setTappedStoreId(null); // Clear tapped state
  }, []);

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

  // Handle incoming store selection from navigation (e.g., from StoreDetailPage "View on Map")
  useEffect(() => {
    const state = location.state as any;
    if (state?.selectedStoreId && stores.length > 0) {
      const storeToSelect = stores.find(s => s.id === state.selectedStoreId);
      if (storeToSelect) {
        setSelectedStore(storeToSelect);
        // Zoom to the store
        if (mapViewRef.current?.flyToStore) {
          mapViewRef.current.flyToStore(storeToSelect.latitude, storeToSelect.longitude);
        }
        // Clear the state so it doesn't re-trigger
        navigate(location.pathname + location.search, { replace: true, state: {} });
      }
    }
  }, [stores, location.state, navigate, location.pathname, location.search]);

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

  // Sort stores
  const sortedStores = useMemo(() => {
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

  // Handle autocomplete suggestion selection (CRITICAL: prevent refresh)
  const handleSearchSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === 'store') {
      // Find the store in our list
      const store = stores.find(s => s.id === suggestion.storeId);
      if (store) {
        // Open the store detail panel
        setSelectedStore(store);

        // Zoom to the store location using mapRef if available
        if (mapViewRef.current?.flyToStore) {
          mapViewRef.current.flyToStore(store.latitude, store.longitude);
        }
      }
    } else if (suggestion.type === 'location') {
      // Set location filters
      if (suggestion.city) {
        setSelectedCity(suggestion.city);
      }
      if (suggestion.neighborhood) {
        setSelectedNeighborhood(suggestion.neighborhood);
      }
      // The MapView will auto-zoom based on the filter change
    }
  }, [stores]);

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
      {/* Scrolling Banner - Desktop only */}
      {!isMobile && <ScrollingBanner />}

      {view === 'map' ? (
        // ========== MAP VIEW - Full Screen with Floating Panels ==========
        <div className={`relative w-full ${
          isMobile
            ? 'h-[calc(100vh-64px)]' // Mobile: just header (64px)
            : 'h-[calc(100vh-64px-48px)]'  // Desktop: header + banner
        }`}>
          {/* Full-screen Map */}
          <MapView
            ref={mapViewRef}
            stores={filteredStores}
            onStoreClick={handleStoreClick}
            selectedCity={selectedCity}
            selectedNeighborhood={selectedNeighborhood}
            activeMainCategory={selectedMainCategory}
            activeSubCategory={selectedSubCategories[0] || null}
            tappedStoreId={tappedStoreId}
            onLabelClick={handleLabelClick}
            styleMode={mapStyleMode}
            onStyleModeChange={setMapStyleMode}
          />

          {/* MOBILE: Floating Filter Bar (overlays map) */}
          {isMobile && (
            <>
              <MobileFilterBar
                selectedMainCategory={selectedMainCategory}
                onMainCategoryChange={handleMainCategoryChange}
                selectedSubCategories={selectedSubCategories}
                onSubCategoryToggle={handleSubCategoryToggle}
                selectedCity={selectedCity}
                selectedNeighborhood={selectedNeighborhood}
                onCityChange={handleCityChange}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenCityDrawer={() => setShowCityDrawer(true)}
                stores={filteredStores}
                onSelectSuggestion={handleSearchSuggestionSelect}
                mapStyleMode={mapStyleMode}
                onMapStyleChange={setMapStyleMode}
                onRandomStore={(store) => {
                  if (mapViewRef.current?.flyToStore) {
                    mapViewRef.current.flyToStore(store.latitude, store.longitude);
                  }
                  setSelectedStore(store);
                }}
                onClearAll={handleClearAll}
              />

              {/* View Toggle Button - Bottom Right */}
              <ViewToggleButton
                currentView="map"
                onToggle={(newView) => setView(newView)}
              />
            </>
          )}

          {/* DESKTOP: Floating Panels (hide on mobile) */}
          {!isMobile && (
            <>
              {/* Floating Search Bar */}
              <FloatingSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search stores, neighborhoods..."
                stores={stores}
                onSelectSuggestion={handleSearchSuggestionSelect}
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
                stores={filteredStores}
                onRandomStore={(store) => {
                  // Zoom to the store and open its detail panel
                  if (mapViewRef.current?.flyToStore) {
                    mapViewRef.current.flyToStore(store.latitude, store.longitude);
                  }
                  setSelectedStore(store);
                }}
                onClearAll={handleClearAll}
              />

              {/* Floating Map Legend */}
              <FloatingMapLegend
                selectedCategory={selectedMainCategory}
                onCategoryClick={handleMainCategoryChange}
              />

              {/* View Toggle Button */}
              <ViewToggleButton
                currentView="map"
                onToggle={(newView) => setView(newView)}
              />
            </>
          )}

          {/* Store Detail Panel (both mobile and desktop - will update in Phase 2) */}
          <AnimatePresence mode="wait">
            {selectedStore && (
              <>
                {console.log('Rendering StoreDetail for:', selectedStore.name)}
                <StoreDetail
                  key={selectedStore.id}
                  store={selectedStore}
                  onClose={() => setSelectedStore(null)}
                />
              </>
            )}
          </AnimatePresence>

          {/* City/Neighborhood Selector Bottom Sheet (Mobile only) */}
          {isMobile && (
            <BottomSheet
              isOpen={showCityDrawer}
              onClose={() => setShowCityDrawer(false)}
              title="Select Location"
            >
              <div className="space-y-6">
                {/* City Selection */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-3 italic" style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
                    City
                  </h3>
                  <div className="space-y-2">
                    {/* All Cities option */}
                    <button
                      onClick={() => {
                        handleCityChange(null);
                        setShowCityDrawer(false);
                      }}
                      className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                        !selectedCity
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-cyan-300'
                          : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                      }`}
                      style={!selectedCity ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
                    >
                      All Cities
                    </button>

                    {/* Individual cities */}
                    {MAJOR_CITIES_JAPAN.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          handleCityChange(city);
                          // Don't close yet if city has neighborhoods
                          if (!LOCATIONS[city] || LOCATIONS[city].length === 0) {
                            setShowCityDrawer(false);
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                          selectedCity === city
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-cyan-300'
                            : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                        }`}
                        style={selectedCity === city ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Neighborhood Selection (show if city selected and has neighborhoods) */}
                {selectedCity && LOCATIONS[selectedCity] && LOCATIONS[selectedCity].length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-3 italic" style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
                      Neighborhoods in {selectedCity}
                    </h3>
                    <div className="space-y-2">
                      {/* All neighborhoods option */}
                      <button
                        onClick={() => {
                          setSelectedNeighborhood(null);
                          setShowCityDrawer(false);
                        }}
                        className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                          !selectedNeighborhood
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-cyan-300'
                            : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                        }`}
                        style={!selectedNeighborhood ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
                      >
                        All Neighborhoods
                      </button>

                      {/* Individual neighborhoods */}
                      {LOCATIONS[selectedCity].map((neighborhood) => (
                        <button
                          key={neighborhood}
                          onClick={() => {
                            setSelectedNeighborhood(neighborhood);
                            setShowCityDrawer(false);
                          }}
                          className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                            selectedNeighborhood === neighborhood
                              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-cyan-300'
                              : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                          }`}
                          style={selectedNeighborhood === neighborhood ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
                        >
                          {neighborhood}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </BottomSheet>
          )}
        </div>
      ) : isMobile ? (
        // ========== MOBILE LIST VIEW - Optimized for mobile ==========
        <MobileListView
          stores={sortedStores}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedMainCategory={selectedMainCategory}
          selectedSubCategories={selectedSubCategories}
          selectedCity={selectedCity}
          selectedNeighborhood={selectedNeighborhood}
          sortBy={sortBy}
          onMainCategoryChange={handleMainCategoryChange}
          onSubCategoryToggle={handleSubCategoryToggle}
          onCityChange={handleCityChange}
          onNeighborhoodChange={setSelectedNeighborhood}
          onSortChange={setSortBy}
          onStoreClick={(store) => {
            const params = Object.fromEntries(searchParams.entries());
            navigate(`/store/${store.slug || store.id}`, { state: { from: '/map', params } });
          }}
          onSelectSuggestion={handleSearchSuggestionSelect}
          onBackToMap={() => setView('map')}
        />
      ) : (
        // ========== DESKTOP LIST VIEW - Sidebar + Grid Layout ==========
        <div className="flex min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative">
          {/* Film grain */}
          <div className="absolute inset-0 film-grain opacity-20 pointer-events-none" />

          {/* Left Sidebar */}
          <ListViewSidebar
            selectedMainCategory={selectedMainCategory}
            selectedSubCategories={selectedSubCategories}
            selectedCity={selectedCity}
            selectedNeighborhood={selectedNeighborhood}
            onMainCategoryChange={handleMainCategoryChange}
            onSubCategoryToggle={handleSubCategoryToggle}
            onCityChange={handleCityChange}
            onNeighborhoodChange={setSelectedNeighborhood}
            onClearAll={handleClearAll}
          />

          {/* Main Content Area */}
          <div className="relative flex-1 p-8">
            {/* Header Bar */}
            <div className="space-y-4 mb-6">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stores, neighborhoods..."
                  className="w-full px-4 py-3 pl-11 bg-gray-900/80 backdrop-blur-sm border-2 border-cyan-400/50 rounded-xl text-sm placeholder-gray-400 text-white focus:outline-none focus:border-cyan-400/80 transition-all"
                  style={{ boxShadow: '0 0 20px rgba(34, 217, 238, 0.2)' }}
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Stats and Controls Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <span>
                    <span className="font-bold text-white">{sortedStores.length}</span> <span className="text-gray-400">stores</span>
                  </span>
                  {/* Random Store Button */}
                  {sortedStores.length > 0 && (
                    <button
                      onClick={() => {
                        const randomIndex = Math.floor(Math.random() * sortedStores.length);
                        setRandomStore(sortedStores[randomIndex]);
                      }}
                      className="p-2 rounded-lg border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all"
                      title="Pick a random store"
                      style={{ boxShadow: '0 0 10px rgba(34, 217, 238, 0.2)' }}
                    >
                      <Dices className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <SortDropdown value={sortBy} onChange={setSortBy} />
                  <button
                    onClick={() => setView('map')}
                    className="relative px-4 py-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white rounded-lg text-sm font-bold hover:scale-105 transition-all flex items-center gap-2 border-2 border-cyan-300/50 overflow-hidden"
                    style={{ boxShadow: '0 0 20px rgba(34, 217, 238, 0.3)' }}
                  >
                    <div className="absolute inset-0 film-grain opacity-10" />
                    <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="relative z-10">Map View</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Store List */}
            <StoreList
              stores={sortedStores}
              onStoreClick={(store) => {
                const params = Object.fromEntries(searchParams.entries());
                navigate(`/store/${store.slug || store.id}`, { state: { from: '/map', params } });
              }}
            />

            {/* Random Store Modal */}
            {randomStore && (
              <RandomStoreModal
                store={randomStore}
                onClose={() => setRandomStore(null)}
                onSpinAgain={() => {
                  const randomIndex = Math.floor(Math.random() * sortedStores.length);
                  setRandomStore(sortedStores[randomIndex]);
                }}
                onViewStore={() => {
                  const params = Object.fromEntries(searchParams.entries());
                  navigate(`/store/${randomStore.slug || randomStore.id}`, { state: { from: '/map', params } });
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
