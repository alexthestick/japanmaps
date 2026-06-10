import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Dices, List } from 'lucide-react';
import { MapView } from '../components/map/MapView';
import { SEOHead } from '../components/seo';
import { StoreList } from '../components/store/StoreList';
import { StoreDetail } from '../components/store/StoreDetail';
import { BottomSheetStoreDetail } from '../components/store/BottomSheetStoreDetail';
import { SpotlightBottomSheet } from '../components/store/SpotlightBottomSheet';
import { DesktopSpotlightPanel } from '../components/map/DesktopSpotlightPanel';
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
import { useScrollDirection } from '../hooks/useScrollDirection';
import { useSpotlightStores } from '../hooks/useSpotlightStores';
import { Loader } from '../components/common/Loader';
import type { Store, MainCategory } from '../types/store';
import { sortStores } from '../utils/helpers';
import { getCityDataWithCounts, type CityData } from '../utils/cityData';
import type { SearchSuggestion } from '../components/store/SearchAutocomplete';
import { MAJOR_CITIES_JAPAN, LOCATIONS, NEIGHBORHOOD_COORDINATES } from '../lib/constants';
import { distanceMeters } from '../utils/distance';
import { RadarCheckinCard } from '../components/radar/RadarCheckinCard';
import { useCheckinCache } from '../hooks/useCheckinCache';

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

  // PHASE 3: Spotlight Mode state
  const [isSpotlightMode, setIsSpotlightMode] = useState(false);
  const [spotlightedStores, setSpotlightedStores] = useState<Store[]>([]);
  const [viewportBounds, setViewportBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);

  // EXPLORE MODE: GPS position updated continuously by GeolocateControl.
  // Nothing reads this yet — it's wired up here so the Explore mode UI
  // can use it for radius filtering without any further plumbing changes.
  const [isExploreMode, setIsExploreMode] = useState(false);
  const [exploreUserPosition, setExploreUserPosition] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);

  // One-time tooltip: shown when user first sees the map, auto-dismisses after 4s.
  // Stored in localStorage so it never shows again after the first dismissal.
  const [showRadarTooltip, setShowRadarTooltip] = useState<boolean>(() => {
    try { return !localStorage.getItem('radar-tooltip-shown'); } catch { return false; }
  });
  useEffect(() => {
    if (!showRadarTooltip) return;
    const t = setTimeout(() => {
      setShowRadarTooltip(false);
      try { localStorage.setItem('radar-tooltip-shown', '1'); } catch {}
    }, 4000);
    return () => clearTimeout(t);
  }, [showRadarTooltip]);

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

  // Simple scroll direction detection - hide filter bar when scrolling down
  const isScrollingDown = useScrollDirection();

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

  // Single consolidated filter object — all active filters in one place.
  // useStores applies these client-side against the full cached store list,
  // so there is no separate filteredStores pass needed.
  const storeFilters = useMemo(() => ({
    countries: [],
    cities: selectedCity ? [selectedCity] : [],
    mainCategories: selectedMainCategory ? [selectedMainCategory] : [],
    categories: selectedSubCategories.length > 0 ? selectedSubCategories as any : [],
    priceRanges: [],
    searchQuery,
    selectedCity,
    selectedNeighborhood,
    selectedCategory: selectedSubCategories[0] || null,
  }), [selectedCity, selectedMainCategory, selectedSubCategories, searchQuery, selectedNeighborhood]);

  // Fetch all stores once (React Query caches for 5 min), apply filters client-side
  const { stores: filteredStores, loading, error } = useStores(storeFilters);

  // EXPLORE MODE: Filter stores to 300m radius around user position.
  // Must be defined after filteredStores — references it directly.
  // In browse mode returns filteredStores unchanged.
  const storesForMap = useMemo(() => {
    if (!isExploreMode || !exploreUserPosition) return filteredStores;
    return filteredStores.filter(store =>
      distanceMeters(
        exploreUserPosition.latitude,
        exploreUserPosition.longitude,
        store.latitude,
        store.longitude
      ) <= 300
    );
  }, [filteredStores, isExploreMode, exploreUserPosition]);

  // RADAR CHECKIN: All stores within 150m, sorted closest-first.
  // Defined after storesForMap — references it directly.
  const nearbyStores = useMemo(() => {
    if (!isExploreMode || !exploreUserPosition) return [];
    return storesForMap
      .map(store => ({
        store,
        dist: distanceMeters(
          exploreUserPosition.latitude,
          exploreUserPosition.longitude,
          store.latitude,
          store.longitude,
        ),
      }))
      .filter(({ dist }) => dist <= 150)
      .sort((a, b) => a.dist - b.dist);
  }, [isExploreMode, exploreUserPosition, storesForMap]);

  // Invalidation timestamp: bumped after every successful stamp so useCheckinCache refetches.
  const [lastStampedAt, setLastStampedAt] = useState(0);

  // Stamped store IDs — always fetched for logged-in users so the stamp badge shows
  // on store detail panels in both Radar and Browse mode.
  const stampedStoreIds = useCheckinCache(true, lastStampedAt);

  // Dismiss state for the check-in card after a successful stamp.
  // Reset whenever the active nearby store changes so the card re-appears for a new store.
  const [cardDismissed, setCardDismissed] = useState(false);

  // Index into nearbyStores — lets the user cycle to the next nearby store via the "+X" chip.
  const [nearbyStoreIndex, setNearbyStoreIndex] = useState(0);

  // Reset index to 0 when the closest store changes (user walks away from one cluster
  // and towards another). Uses the store ID at position 0 as the anchor — if that
  // changes, the whole list has shifted and the saved index is meaningless.
  const closestStoreId = nearbyStores[0]?.store.id ?? null;
  useEffect(() => {
    setNearbyStoreIndex(0);
    setCardDismissed(false); // new store in range — show the card fresh
  }, [closestStoreId]);

  // Clamp index so it's never out-of-bounds when the list shrinks (user walks away from stores).
  const safeNearbyIndex = Math.min(nearbyStoreIndex, Math.max(0, nearbyStores.length - 1));
  const nearbyStoreEntry = nearbyStores[safeNearbyIndex] ?? null;

  // Dynamic check-in radius: widen when GPS is poor (Tokyo urban canyons), cap at 150m.
  const checkinRadius = useMemo(() => {
    const accuracy = exploreUserPosition?.accuracy;
    if (!accuracy) return 50;
    return Math.min(150, Math.max(50, accuracy * 1.5));
  }, [exploreUserPosition?.accuracy]);

  // EXPLORE MODE: Detect closest neighborhood for the status bar.
  const exploreNeighborhood = useMemo(() => {
    if (!exploreUserPosition) return null;
    let closestName: string | null = null;
    let closestDist = Infinity;
    for (const [name, coords] of Object.entries(NEIGHBORHOOD_COORDINATES)) {
      const dist = distanceMeters(
        exploreUserPosition.latitude,
        exploreUserPosition.longitude,
        coords.latitude,
        coords.longitude
      );
      if (dist < closestDist) {
        closestDist = dist;
        closestName = name;
      }
    }
    return closestDist < 1500 ? closestName : null;
  }, [exploreUserPosition]);

  // Handle incoming store selection from navigation (e.g., from StoreDetailPage "View on Map")
  useEffect(() => {
    const state = location.state as any;
    if (state?.selectedStoreId && filteredStores.length > 0) {
      const storeToSelect = filteredStores.find(s => s.id === state.selectedStoreId);
      if (storeToSelect) {
        setSelectedStore(storeToSelect);
        if (mapViewRef.current?.flyToStore) {
          mapViewRef.current.flyToStore(storeToSelect.latitude, storeToSelect.longitude);
        }
        navigate(location.pathname + location.search, { replace: true, state: {} });
      }
    }
  }, [filteredStores, location.state, navigate, location.pathname, location.search]);

  // Sort the already-filtered stores — sort is always the last step
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

  // PHASE 3: Always compute spotlight stores against current viewport so the
  // result is ready the instant the button is pressed (not one render behind).
  // The scoring memo inside useSpotlightStores is cheap (~1ms for 899 stores)
  // and only re-runs when filteredStores or viewportBounds actually change.
  const curatedSpotlightStores = useSpotlightStores(
    filteredStores,
    viewportBounds,
    { count: 5 }
  );

  // PHASE 3: Handle spotlight mode toggle
  const handleSearchArea = useCallback(() => {
    if (isSpotlightMode) {
      // Clear spotlight mode
      setIsSpotlightMode(false);
      setSpotlightedStores([]);
      console.log('Spotlight mode cleared');
    } else {
      // Activate spotlight mode with curated stores
      setSpotlightedStores(curatedSpotlightStores);
      setIsSpotlightMode(true);
      console.log('Spotlight mode activated:', curatedSpotlightStores.length, 'stores', curatedSpotlightStores);
    }
  }, [isSpotlightMode, curatedSpotlightStores]);

  // Radar mode toggle — closes any open bottom sheet before switching modes
  // so Browse and Radar UI never overlap.
  const handleRadarToggle = useCallback(() => {
    if (isExploreMode) {
      setSelectedStore(null);
      setExploreUserPosition(null);
      setNearbyStoreIndex(0);
    }
    setIsExploreMode(prev => !prev);
  }, [isExploreMode]);

  // Called by RadarCheckinCard after a successful stamp or re-verification.
  // Bumps lastStampedAt → invalidates useCheckinCache → marker turns green immediately.
  const handleCheckinSuccess = useCallback((_storeName: string, _isVerification: boolean) => {
    setLastStampedAt(Date.now());
  }, []);

  // Handle autocomplete suggestion selection (CRITICAL: prevent refresh)
  const handleSearchSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === 'store') {
      // Find the store in our list
      const store = filteredStores.find(s => s.id === suggestion.storeId);
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
  }, [filteredStores]);

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
      <SEOHead
        title="Explore the Map — Lost in Transit JP"
        description="Interactive map of 899+ vintage, archive, and streetwear stores across Japan. Filter by city, neighborhood, and category."
        url="/map"
      />
      {/* Scrolling Banner - Desktop only */}
      {!isMobile && <ScrollingBanner />}

      {view === 'map' ? (
        // ========== MAP VIEW - Full Screen with Floating Panels ==========
        <>
        <div
          className="relative w-full"
          style={{
            // Mobile: Use svh (small viewport height) for smooth, stable scrolling
            // Desktop: Standard vh with header + banner
            height: isMobile
              ? 'calc(100svh - 64px)'
              : 'calc(100vh - 64px - 48px)'
          }}
        >
          {/* Full-screen Map */}
          <MapView
            ref={mapViewRef}
            stores={storesForMap}
            onStoreClick={handleStoreClick}
            selectedCity={selectedCity}
            selectedNeighborhood={selectedNeighborhood}
            activeMainCategory={selectedMainCategory}
            activeSubCategory={selectedSubCategories[0] || null}
            tappedStoreId={tappedStoreId}
            onLabelClick={handleLabelClick}
            styleMode={mapStyleMode}
            onStyleModeChange={setMapStyleMode}
            onSearchArea={handleSearchArea}
            selectedStore={selectedStore}
            onViewportChange={setViewportBounds}
            spotlightedStoreIds={spotlightedStores.map(s => s.id)}
            isSpotlightMode={isSpotlightMode}
            isExploreMode={isExploreMode}
            onUserPositionUpdate={setExploreUserPosition}
            exploreUserPosition={exploreUserPosition}
            stampedStoreIds={stampedStoreIds}
            checkinRadius={checkinRadius}
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
                isHidden={isScrollingDown || isSpotlightMode}
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
                stores={filteredStores}
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

          {/* UNIFIED BOTTOM BAR (mobile map only) ─────────────────────────────
              Radar pill (left) + List View icon (right) in one horizontal zone.
              Hides entirely when a store sheet or spotlight panel is open.
              Anticipates the iOS tab bar layout: when Capacitor ships, List View
              moves to the tab bar and this zone becomes Radar-only.
          ─────────────────────────────────────────────────────────────────── */}
          {isMobile && view === 'map' && (
            <>
              {/* Status bar — shows when Radar is active */}
              {isExploreMode && (
                <div
                  className="absolute left-1/2 z-[30] flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium backdrop-blur-md"
                  style={{
                    transform: 'translateX(-50%)',
                    bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
                    whiteSpace: 'nowrap',
                    backgroundColor: 'rgba(10, 10, 15, 0.88)',
                    border: '1px solid rgba(34, 217, 238, 0.35)',
                    color: '#22D9EE',
                  }}
                >
                  {!exploreUserPosition ? (
                    // Locating…
                    <>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'rgba(34,217,238,0.4)', display: 'inline-block', flexShrink: 0 }} />
                      Locating…
                    </>
                  ) : storesForMap.length === 0 ? (
                    // No stores in range
                    <>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'rgba(34,217,238,0.3)', display: 'inline-block', flexShrink: 0 }} />
                      No stores within 300m
                      {exploreUserPosition.accuracy && exploreUserPosition.accuracy > 25 && (
                        <span style={{ color: 'rgba(251,191,36,0.9)', marginLeft: 4 }}>· GPS weak</span>
                      )}
                    </>
                  ) : (
                    // Stores in range
                    <>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22D9EE', display: 'inline-block', flexShrink: 0 }} />
                      {exploreNeighborhood ? exploreNeighborhood : 'Nearby'}{' '}
                      · {storesForMap.length} store{storesForMap.length !== 1 ? 's' : ''}
                      {exploreUserPosition.accuracy && exploreUserPosition.accuracy > 25 && (
                        <span style={{ color: 'rgba(251,191,36,0.9)', marginLeft: 4 }}>· GPS weak</span>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* RADAR CHECK-IN CARD ─────────────────────────────────────────
                  Slides up when user enters 150m of a store in Radar mode.
                  Keyed by store.id so AnimatePresence re-mounts the card
                  (and resets its internal state) whenever the closest store changes.
              ──────────────────────────────────────────────────────────────── */}
              <AnimatePresence>
                {isExploreMode && nearbyStoreEntry && !selectedStore && !cardDismissed && (
                  <motion.div
                    key={nearbyStoreEntry.store.id}
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 60, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="absolute left-4 right-4 z-[35]"
                    style={{ bottom: 'calc(9.5rem + env(safe-area-inset-bottom, 0px))' }}
                  >
                    <RadarCheckinCard
                      store={nearbyStoreEntry.store}
                      distance={nearbyStoreEntry.dist}
                      checkinRadius={checkinRadius}
                      isInRange={nearbyStoreEntry.dist <= checkinRadius}
                      nearbyCount={nearbyStores.length}
                      onNextStore={() =>
                        setNearbyStoreIndex(i => (i + 1) % nearbyStores.length)
                      }
                      userPosition={exploreUserPosition!}
                      onCheckinSuccess={handleCheckinSuccess}
                      onDismiss={() => setCardDismissed(true)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Radar + List View unified bar */}
              {!selectedStore && !isSpotlightMode && (
                <div
                  className="absolute left-0 right-0 z-[30] flex items-center justify-between px-5"
                  style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
                >
                  {/* Onboarding tooltip — first time only, auto-dismisses after 4s */}
                  {showRadarTooltip && !isExploreMode && (
                    <div
                      className="absolute left-0 bottom-full mb-3 px-4 py-2.5 rounded-xl text-xs font-medium text-white backdrop-blur-md pointer-events-none"
                      style={{
                        backgroundColor: 'rgba(10,10,15,0.92)',
                        border: '1px solid rgba(34,217,238,0.4)',
                        boxShadow: '0 0 20px rgba(34,217,238,0.2)',
                        maxWidth: '200px',
                      }}
                    >
                      <span style={{ color: '#22D9EE' }}>◎</span>{' '}
                      Tap to discover stores as you walk nearby
                      {/* Pointer triangle */}
                      <div style={{
                        position: 'absolute',
                        bottom: -6,
                        left: 24,
                        width: 12,
                        height: 12,
                        backgroundColor: 'rgba(10,10,15,0.92)',
                        borderRight: '1px solid rgba(34,217,238,0.4)',
                        borderBottom: '1px solid rgba(34,217,238,0.4)',
                        transform: 'rotate(45deg)',
                      }} />
                    </div>
                  )}

                  {/* Radar pill */}
                  <button
                    onClick={handleRadarToggle}
                    className="flex items-center gap-2.5 px-5 py-3 rounded-full font-semibold text-sm transition-all duration-300 backdrop-blur-md"
                    style={isExploreMode ? {
                      backgroundColor: '#22D9EE',
                      color: '#0a0a0f',
                      border: '2px solid rgba(34,217,238,0.9)',
                      boxShadow: '0 0 24px rgba(34,217,238,0.5), 0 4px 16px rgba(0,0,0,0.4)',
                    } : {
                      backgroundColor: 'rgba(10,10,15,0.85)',
                      color: '#22D9EE',
                      border: '2px solid rgba(34,217,238,0.4)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    }}
                  >
                    {/* Radar SVG icon with sweep animation in Browse mode */}
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3" opacity="0.45" />
                      <circle cx="9" cy="9" r="4.2" stroke="currentColor" strokeWidth="1.3" opacity="0.65" />
                      <circle cx="9" cy="9" r="1.4" fill="currentColor" />
                      {!isExploreMode && (
                        <g style={{ transformOrigin: '9px 9px', animation: 'radar-sweep 4s linear infinite' }}>
                          <line x1="9" y1="9" x2="9" y2="1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </g>
                      )}
                    </svg>
                    {isExploreMode ? '← Browse' : 'Radar'}
                  </button>

                  {/* List View icon button */}
                  <button
                    onClick={() => setView('list')}
                    className="flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md transition-all duration-200"
                    style={{
                      backgroundColor: 'rgba(10,10,15,0.85)',
                      border: '2px solid rgba(255,255,255,0.15)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                      color: 'rgba(255,255,255,0.8)',
                    }}
                    title="List View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* PHASE 3 REDESIGN: Unified Bottom Sheet - Spotlight Peek OR Store Detail */}
          {isMobile ? (
            // Mobile: Unified bottom sheet with dual modes
            <SpotlightBottomSheet
              isSpotlightMode={isSpotlightMode}
              spotlightedStores={spotlightedStores}
              selectedStore={selectedStore}
              isStamped={selectedStore ? stampedStoreIds.has(selectedStore.id) : false}
              onStoreSelect={(store) => {
                setSelectedStore(store);
                // Pan map to store
                if (mapViewRef.current?.flyToStore) {
                  mapViewRef.current.flyToStore(store.latitude, store.longitude);
                }
              }}
              onDismiss={() => {
                setIsSpotlightMode(false);
                setSpotlightedStores([]);
              }}
              onClose={() => setSelectedStore(null)}
            />
          ) : (
            // Desktop: Spotlight panel + Right Sidebar
            <>
              {/* Desktop spotlight panel — shown when spotlight active and no store selected */}
              {isSpotlightMode && !selectedStore && (
                <DesktopSpotlightPanel
                  stores={spotlightedStores}
                  onStoreSelect={(store) => {
                    setSelectedStore(store);
                    if (mapViewRef.current?.flyToStore) {
                      // Desktop: zoom in tight (16) and offset left so pin sits
                      // in the visible map area, clear of the StoreDetail sidebar.
                      // Negative X shifts the target point left → pin appears
                      // more centered in the left ~60% of the viewport.
                      mapViewRef.current.flyToStore(store.latitude, store.longitude, {
                        zoom: 16,
                        offset: [-160, 0],
                      });
                    }
                  }}
                  onDismiss={() => {
                    setIsSpotlightMode(false);
                    setSpotlightedStores([]);
                  }}
                />
              )}
              <AnimatePresence mode="wait">
                {selectedStore && (
                  <StoreDetail
                    key={selectedStore.id}
                    store={selectedStore}
                    isStamped={stampedStoreIds.has(selectedStore.id)}
                    onClose={() => {
                      setSelectedStore(null);
                      // If we came from spotlight, keep spotlight active so panel re-appears
                    }}
                  />
                )}
              </AnimatePresence>
            </>
          )}

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
        </>
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
            // Save scroll so MobileListView can restore position on return
            sessionStorage.setItem('listScrollY', String(window.scrollY));
            navigate(`/store/${store.slug || store.id}`, { state: { from: 'list' } });
          }}
          onSelectSuggestion={handleSearchSuggestionSelect}
          onBackToMap={() => setView('map')}
          onClearAll={handleClearAll}
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
          <div className="relative flex-1 min-w-0 flex flex-col">
            {/* Sticky Header — stays visible while 899 cards scroll underneath.
                backdrop-blur gives a frosted glass effect over the card grid. */}
            <div
              className="sticky z-40 px-8 pt-6 pb-4 bg-gray-900/95 backdrop-blur-sm border-b border-cyan-400/10 space-y-4"
              style={{ top: 'var(--header-height)' }}
            >
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
                    <span className="font-bold text-white">{sortedStores.length}</span>{' '}
                    <span className="text-gray-400">{sortedStores.length === 1 ? 'store' : 'stores'}</span>
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
                  <SortDropdown sortBy={sortBy} onSortChange={setSortBy} selectedCity={selectedCity} />
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
            </div>{/* end sticky header */}

            {/* Active filter chips — always in the DOM so the layout never shifts.
                maxHeight animates from 0→auto so chips slide in/out smoothly
                instead of popping in and causing a scroll-anchor jump. */}
            {(() => {
              const hasChips = !!(selectedMainCategory || selectedSubCategories.length > 0 || selectedCity || selectedNeighborhood);
              return (
                <div
                  className="px-8 flex flex-wrap gap-2 overflow-hidden transition-all duration-150"
                  style={{
                    maxHeight: hasChips ? '120px' : '0px',
                    paddingTop: hasChips ? '0.75rem' : '0',
                    paddingBottom: hasChips ? '0.5rem' : '0',
                  }}
                >
                  {selectedMainCategory && (
                    <button
                      onClick={() => handleMainCategoryChange(null)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-500/30 transition-all"
                      style={{ boxShadow: '0 0 10px rgba(34, 217, 238, 0.2)' }}
                    >
                      {selectedMainCategory} <span className="opacity-60">×</span>
                    </button>
                  )}
                  {selectedSubCategories.map(sub => (
                    <button
                      key={sub}
                      onClick={() => handleSubCategoryToggle(sub)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/50 hover:bg-purple-500/30 transition-all"
                    >
                      {sub} <span className="opacity-60">×</span>
                    </button>
                  ))}
                  {selectedCity && (
                    <button
                      onClick={() => handleCityChange(null)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-500/30 transition-all"
                      style={{ boxShadow: '0 0 10px rgba(34, 217, 238, 0.2)' }}
                    >
                      {selectedCity} <span className="opacity-60">×</span>
                    </button>
                  )}
                  {selectedNeighborhood && (
                    <button
                      onClick={() => setSelectedNeighborhood(null)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/50 hover:bg-purple-500/30 transition-all"
                    >
                      {selectedNeighborhood} <span className="opacity-60">×</span>
                    </button>
                  )}
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-gray-400 border border-gray-600/50 hover:text-red-400 hover:border-red-400/50 transition-all"
                  >
                    Clear all
                  </button>
                </div>
              );
            })()}

            {/* Store List — scrolls independently under the sticky header */}
            <div className="px-8 py-6">
            <StoreList
              stores={sortedStores}
              onStoreClick={(store) => {
                const params = Object.fromEntries(searchParams.entries());
                navigate(`/store/${store.slug || store.id}`, { state: { from: '/map', params } });
              }}
              onClearFilters={handleClearAll}
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
            </div>{/* end store list wrapper */}
          </div>
        </div>
      )}
    </>
  );
}
