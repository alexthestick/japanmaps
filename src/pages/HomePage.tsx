import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Dices, List, Trophy } from 'lucide-react';
import { MapView } from '../components/map/MapView';
import { SEOHead } from '../components/seo';
import { StoreList } from '../components/store/StoreList';
import { StoreDetail } from '../components/store/StoreDetail';
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
// getCityDataWithCounts is currently unused (city data not shown in this view)
// import { getCityDataWithCounts, type CityData } from '../utils/cityData';
import type { SearchSuggestion } from '../components/store/SearchAutocomplete';
import { MAJOR_CITIES_JAPAN, LOCATIONS, NEIGHBORHOOD_COORDINATES } from '../lib/constants';
import { distanceMeters } from '../utils/distance';
import { RadarCheckinCard } from '../components/radar/RadarCheckinCard';
import { RadarFieldReport } from '../components/radar/RadarFieldReport';
import { PostStampHaulPrompt } from '../components/radar/PostStampHaulPrompt';
import { RadarHUD, getRadarHudHeight } from '../components/radar/RadarHUD';
import { NeighborhoodEntryCard } from '../components/radar/NeighborhoodEntryCard';
import { QuestMenuSheet } from '../components/radar/QuestMenuSheet';
import { QuestDetailSheet } from '../components/radar/QuestDetailSheet';
import { useCheckinCache } from '../hooks/useCheckinCache';
import { useNeighborhoodQuests } from '../hooks/useNeighborhoodQuests';
import { NeighborhoodCompleteCard } from '../components/radar/NeighborhoodCompleteCard';

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

  // Handle store clicks with two-tap behavior on mobile (bypassed in radar mode)
  const handleStoreClick = useCallback((store: Store) => {
    if (isMobile && !isExploreMode) {
      // Mobile browse mode: Two-tap behavior (first tap shows label, second opens panel)
      if (tappedStoreId === store.id) {
        setSelectedStore(store);
        setTappedStoreId(null);
      } else {
        setTappedStoreId(store.id);
        setTimeout(() => {
          setTappedStoreId(prev => prev === store.id ? null : prev);
        }, 3000);
      }
    } else {
      // Desktop OR radar mode: single tap opens detail panel immediately
      setSelectedStore(store);
    }
  }, [isMobile, tappedStoreId, isExploreMode]);

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

  // Neighborhood quest system — computes all-time progress for each neighborhood.
  // Runs unconditionally (same rule as useSpotlightStores) so results are ready
  // the instant the user enters a new neighborhood without a one-render lag.
  const questsByNeighborhood = useNeighborhoodQuests(stampedStoreIds);

  // Dismiss state for the check-in card after a successful stamp.
  // Reset whenever the active nearby store changes so the card re-appears for a new store.
  const [cardDismissed, setCardDismissed] = useState(false);

  // ── Radar session tracking ───────────────────────────────────────────────
  // sessionPositionsRef: ring-buffer of GPS fixes — used for Haversine distance
  //   on exit. Ref (not state) so GPS ticks don't cause re-renders.
  // sessionStampCountRef: ref copy for exit summary calculation (same reason).
  // sessionStampCount: reactive STATE copy so the HUD counter re-renders live.
  const sessionPositionsRef  = useRef<Array<{ lat: number; lng: number }>>([]);
  const sessionStampCountRef    = useRef(0);
  const sessionStampedStoresRef = useRef<Store[]>([]);
  const sessionStartTimeRef     = useRef<number>(0);
  const [sessionStampCount, setSessionStampCount] = useState(0);

  // Live walking distance this session (metres). Updated on each GPS tick.
  // Displayed in the HUD row 2 right zone. Reset to 0 on each radar entry.
  const [sessionDistanceM, setSessionDistanceM] = useState(0);

  // Neighborhood entry card — shown when user crosses into a new neighborhood.
  // prevNeighborhoodRef tracks what we last showed so we don't re-fire.
  const prevNeighborhoodRef = useRef<string | null>(null);
  const [neighborhoodEntry, setNeighborhoodEntry] = useState<{
    name: string;
    isReturning: boolean;
    storeCount: number;
  } | null>(null);

  // Neighborhood quest system — tracks which neighborhoods were completed this
  // session so the full-screen card fires exactly once per neighborhood per session.
  const sessionCompletedNeighborhoodsRef = useRef<Set<string>>(new Set());
  const [neighborhoodComplete, setNeighborhoodComplete] = useState<{
    neighborhood: string;
    storeCount: number;
    questSlug: string;
  } | null>(null);

  // Exit confirmation: first tap → pending state (3s window), second tap → exit.
  // Skipped entirely when sessionStampCount === 0 (nothing to protect).
  const [exitConfirmPending, setExitConfirmPending] = useState(false);
  const exitConfirmTimerRef = useRef<NodeJS.Timeout>();

  // Session summary overlay — shown after Radar exits with ≥1 stamp.
  // Rendered as RadarFieldReport (full-screen debrief). Manual dismiss only.
  const [sessionSummary, setSessionSummary] = useState<{
    stamps: number;
    distanceKm: number;
    durationMinutes: number;
    neighborhood: string | null;
    stores: Store[];
  } | null>(null);

  // Post-stamp haul prompt — store that was just stamped (null = hidden).
  const [haulPromptStore, setHaulPromptStore] = useState<Store | null>(null);

  // Quest UI state — menu + detail sheet (both in radar mode only)
  const [questMenuOpen, setQuestMenuOpen] = useState(false);
  const [questDetailNeighborhood, setQuestDetailNeighborhood] = useState<string | null>(null);

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

  // Stamps in the current neighborhood this session.
  // Re-computed whenever the neighborhood changes or a new stamp is added.
  // sessionStampedStoresRef is a ref (not reactive) so we use sessionStampCount
  // as a reactive trigger — it bumps on every stamp.
  const neighborhoodStampCount = useMemo(() => {
    if (!exploreNeighborhood) return 0;
    return sessionStampedStoresRef.current.filter(
      s => s.neighborhood === exploreNeighborhood
    ).length;
  }, [exploreNeighborhood, sessionStampCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Current neighborhood's quest progress — drives RadarHUD row 3 and NeighborhoodEntryCard topOffset.
  const currentQuestProgress = useMemo(() => {
    if (!isExploreMode || !exploreNeighborhood) return null;
    return questsByNeighborhood.get(exploreNeighborhood) ?? null;
  }, [isExploreMode, exploreNeighborhood, questsByNeighborhood]);

  // True when the quest row is visible inside the HUD (affects layout of things below it).
  const hasQuestRow = !!currentQuestProgress && currentQuestProgress.total > 0;
  // Top offset for NeighborhoodEntryCard: clears HUD + optional quest row + 4px gap.
  const questTopOffset = getRadarHudHeight(hasQuestRow) + 4;

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
  // Exit confirmation: if stamps > 0, first tap arms a 3-second confirm window.
  // Second tap within that window (or immediate if no stamps) actually exits.
  const handleRadarToggle = useCallback(() => {
    if (isExploreMode) {
      const stampCount = sessionStampCountRef.current;

      // ── First tap with stamps: arm the confirm window ───────────────────
      if (stampCount > 0 && !exitConfirmPending) {
        setExitConfirmPending(true);
        exitConfirmTimerRef.current = setTimeout(() => {
          setExitConfirmPending(false);
        }, 3000);
        return; // don't exit yet
      }

      // ── Second tap (or no stamps): actually exit ────────────────────────
      clearTimeout(exitConfirmTimerRef.current);
      setExitConfirmPending(false);
      setHaulPromptStore(null); // clear any in-flight haul prompt before exit

      if (stampCount > 0) {
        // Sum consecutive Haversine segments for total walking distance
        const positions = sessionPositionsRef.current;
        let totalMeters = 0;
        for (let i = 1; i < positions.length; i++) {
          totalMeters += distanceMeters(
            positions[i - 1].lat, positions[i - 1].lng,
            positions[i].lat,     positions[i].lng,
          );
        }
        const durationMinutes = (Date.now() - sessionStartTimeRef.current) / 60_000;
        setSessionSummary({
          stamps: stampCount,
          distanceKm: totalMeters / 1000,
          durationMinutes,
          neighborhood: exploreNeighborhood,
          stores: [...sessionStampedStoresRef.current],
        });
      }

      // Reset session state + refs for next Radar session
      sessionPositionsRef.current      = [];
      sessionStampCountRef.current     = 0;
      sessionStampedStoresRef.current  = [];
      setSessionStampCount(0);

      setSelectedStore(null);
      setExploreUserPosition(null);
      setNearbyStoreIndex(0);
    } else {
      // ── Entering Radar mode — record start time and clear session state ──
      sessionStartTimeRef.current     = Date.now();
      sessionStampedStoresRef.current = [];
      setSessionDistanceM(0);
      prevNeighborhoodRef.current = null;
      setNeighborhoodEntry(null);
      sessionCompletedNeighborhoodsRef.current = new Set();
      setNeighborhoodComplete(null);
    }
    setIsExploreMode(prev => !prev);
  }, [isExploreMode, exploreNeighborhood, exitConfirmPending]);

  // Accumulate GPS positions into the session ring-buffer while Radar is active.
  // Also tracks live walking distance (Haversine delta per fix) for HUD display.
  // Throttled naturally by the GPS watchPosition interval (~1s on device).
  // Gap guard: skip segments > 200m to suppress GPS jumps (same threshold as MapView trail).
  useEffect(() => {
    if (!isExploreMode || !exploreUserPosition) return;
    const { latitude: lat, longitude: lng } = exploreUserPosition;
    const prev = sessionPositionsRef.current[sessionPositionsRef.current.length - 1];
    if (prev) {
      const seg = distanceMeters(prev.lat, prev.lng, lat, lng);
      if (seg < 200) {
        setSessionDistanceM(d => d + seg);
      }
    }
    sessionPositionsRef.current.push({ lat, lng });
  }, [isExploreMode, exploreUserPosition]);

  // Detect neighborhood changes while Radar is active and fire the entry card.
  // Compares exploreNeighborhood against prevNeighborhoodRef — fires on:
  //   • Initial GPS lock + neighborhood detection (prev = null → first area)
  //   • User walking from one area to another (Harajuku → Shibuya)
  // If GPS is lost (exploreNeighborhood → null), prev ref is reset so re-entry
  // triggers the card again.
  useEffect(() => {
    if (!isExploreMode) {
      prevNeighborhoodRef.current = null;
      return;
    }
    if (!exploreNeighborhood) {
      prevNeighborhoodRef.current = null;
      return;
    }
    if (exploreNeighborhood === prevNeighborhoodRef.current) return;

    // Neighborhood changed — fire the entry card
    prevNeighborhoodRef.current = exploreNeighborhood;

    const storeCount = filteredStores.filter(
      s => s.neighborhood === exploreNeighborhood
    ).length;

    const isReturning = sessionStampedStoresRef.current.some(
      s => s.neighborhood === exploreNeighborhood
    );

    setNeighborhoodEntry({ name: exploreNeighborhood, isReturning, storeCount });
  }, [isExploreMode, exploreNeighborhood, filteredStores]);

  // Detect when a neighborhood quest becomes complete after a stamp.
  // Fires whenever stampedStoreIds updates (i.e., after each stamp refetch).
  // Only triggers the card once per neighborhood per session (sessionCompletedNeighborhoodsRef).
  useEffect(() => {
    if (!isExploreMode || !exploreNeighborhood) return;
    const progress = questsByNeighborhood.get(exploreNeighborhood);
    if (!progress || !progress.isComplete) return;
    if (sessionCompletedNeighborhoodsRef.current.has(exploreNeighborhood)) return;

    // First completion in this session — fire the card
    sessionCompletedNeighborhoodsRef.current.add(exploreNeighborhood);
    setNeighborhoodComplete({
      neighborhood: exploreNeighborhood,
      storeCount: progress.total,
      questSlug: progress.questSlug,
    });
  }, [stampedStoreIds, isExploreMode, exploreNeighborhood, questsByNeighborhood]);

  // Called by RadarCheckinCard after a successful stamp or re-verification.
  // Bumps lastStampedAt → invalidates useCheckinCache → marker turns green immediately.
  // Also increments both the ref (for exit distance calc) and reactive state (for HUD).
  const handleCheckinSuccess = useCallback((_storeName: string, _isVerification: boolean) => {
    setLastStampedAt(Date.now());
    sessionStampCountRef.current += 1;
    setSessionStampCount(c => c + 1);
    // Track this store in the session list (deduplicate — re-verifications don't re-add)
    if (nearbyStoreEntry?.store) {
      const alreadyTracked = sessionStampedStoresRef.current.some(
        s => s.id === nearbyStoreEntry.store.id
      );
      if (!alreadyTracked) {
        sessionStampedStoresRef.current.push(nearbyStoreEntry.store);
      }
      // Show haul prompt after the check-in card auto-dismisses (3s)
      setTimeout(() => {
        setHaulPromptStore(nearbyStoreEntry.store);
      }, 3200); // 200ms after the card's 3s auto-dismiss fires
    }
  }, [nearbyStoreEntry?.store]);

  // Called when the haul prompt is closed (submitted or dismissed).
  // If more nearby stores exist, auto-advance so the next store's card appears.
  const handleHaulPromptClose = useCallback(() => {
    setHaulPromptStore(null);
    if (nearbyStores.length > 1) {
      setNearbyStoreIndex(i => (i + 1) % nearbyStores.length);
    }
    setCardDismissed(false);
  }, [nearbyStores.length]);

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
            activeRadarStoreId={isExploreMode ? (nearbyStoreEntry?.store.id ?? null) : null}
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
                isHidden={isScrollingDown || isSpotlightMode || isExploreMode}
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
              {/* ── RADAR HUD — top strip, replaces search/filters ──────────
                  Mounts when isExploreMode, sits at top of the map container.
                  AnimatePresence handles the crossfade with the filter bar. */}
              <AnimatePresence>
                {isExploreMode && (
                  <RadarHUD
                    hasGps={!!exploreUserPosition}
                    stampCount={sessionStampCount}
                    distanceM={sessionDistanceM}
                    neighborhood={exploreNeighborhood}
                    neighborhoodStampCount={neighborhoodStampCount}
                    nearestStore={
                      nearbyStoreEntry
                        ? { name: nearbyStoreEntry.store.name, distanceM: nearbyStoreEntry.dist }
                        : null
                    }
                    questProgress={currentQuestProgress}
                  />
                )}
              </AnimatePresence>

              {/* NEIGHBORHOOD ENTRY CARD ─────────────────────────────────────
                  RPG-style "entering neighborhood" notification.
                  Slides down from below the HUD when the user crosses into
                  a new area. Auto-dismisses after 2.5 seconds.
                  z-[45]: below HUD (z-50), above check-in card (z-35).
              ──────────────────────────────────────────────────────────────── */}
              <AnimatePresence>
                {isExploreMode && neighborhoodEntry && (
                  <NeighborhoodEntryCard
                    key={neighborhoodEntry.name}
                    neighborhood={neighborhoodEntry.name}
                    isReturning={neighborhoodEntry.isReturning}
                    storeCount={neighborhoodEntry.storeCount}
                    onDismiss={() => setNeighborhoodEntry(null)}
                    questProgress={questsByNeighborhood.get(neighborhoodEntry.name)}
                    topOffset={questTopOffset}
                  />
                )}
              </AnimatePresence>

              {/* NEIGHBORHOOD COMPLETE CARD ──────────────────────────────────
                  Full-screen achievement overlay — shown once per neighborhood
                  per session when the user stamps the final quest store.
                  z-[250] clears HUD (z-50) and BottomSheet (z-[201]).
              ──────────────────────────────────────────────────────────────── */}
              <AnimatePresence>
                {isExploreMode && neighborhoodComplete && (
                  <NeighborhoodCompleteCard
                    key={neighborhoodComplete.neighborhood}
                    neighborhood={neighborhoodComplete.neighborhood}
                    storeCount={neighborhoodComplete.storeCount}
                    questSlug={neighborhoodComplete.questSlug}
                    onDismiss={() => setNeighborhoodComplete(null)}
                  />
                )}
              </AnimatePresence>

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
                      onNextStore={() => {
                        const nextIdx = (safeNearbyIndex + 1) % nearbyStores.length;
                        setNearbyStoreIndex(nextIdx);
                        const nextStore = nearbyStores[nextIdx]?.store;
                        if (nextStore && mapViewRef.current) {
                          mapViewRef.current.flyToStore(nextStore.latitude, nextStore.longitude, { zoom: 17, offset: [0, -120] });
                        }
                      }}
                      userPosition={exploreUserPosition!}
                      onCheckinSuccess={handleCheckinSuccess}
                      onDismiss={() => setCardDismissed(true)}
                      onViewStore={(store) => setSelectedStore(store)}
                      onLogFind={(store) => setHaulPromptStore(store)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* POST-STAMP HAUL PROMPT ──────────────────────────────────────
                  Slides up after check-in card auto-dismisses. Invitation to
                  log a find. Disappears on close or after submit.
              ──────────────────────────────────────────────────────────────── */}
              <AnimatePresence>
                {haulPromptStore && !selectedStore && (
                  <PostStampHaulPrompt
                    store={haulPromptStore}
                    onClose={handleHaulPromptClose}
                  />
                )}
              </AnimatePresence>

              {/* SESSION SUMMARY ─────────────────────────────────────────────
                  Slides up after Radar exit when ≥1 stamp was made.
                  Auto-dismisses after 4s or on tap.
              ──────────────────────────────────────────────────────────────── */}
              <AnimatePresence>
                {sessionSummary && !isExploreMode && (
                  <RadarFieldReport
                    stamps={sessionSummary.stamps}
                    distanceKm={sessionSummary.distanceKm}
                    durationMinutes={sessionSummary.durationMinutes}
                    neighborhood={sessionSummary.neighborhood}
                    stores={sessionSummary.stores}
                    onDismiss={() => setSessionSummary(null)}
                    onLogFind={(store) => {
                      setSessionSummary(null);
                      setHaulPromptStore(store);
                    }}
                  />
                )}
              </AnimatePresence>

              {/* QUEST MENU SHEET ────────────────────────────────────────────
                  Trophy button → full quest list.
                  Tap a row → closes menu, opens QuestDetailSheet for that
                  neighborhood. z-[202] to clear BottomSheet (z-[201]).
              ──────────────────────────────────────────────────────────── */}
              <QuestMenuSheet
                isOpen={questMenuOpen}
                onClose={() => setQuestMenuOpen(false)}
                questsByNeighborhood={questsByNeighborhood}
                currentNeighborhood={exploreNeighborhood}
                onQuestTap={(neighborhood) => {
                  setQuestMenuOpen(false);
                  setQuestDetailNeighborhood(neighborhood);
                }}
              />

              {/* QUEST DETAIL SHEET ──────────────────────────────────────────
                  Store list for a single quest. Tap store → flyToStore + close.
                  Back → reopens QuestMenuSheet.
              ──────────────────────────────────────────────────────────── */}
              <QuestDetailSheet
                isOpen={!!questDetailNeighborhood}
                quest={questDetailNeighborhood ? (questsByNeighborhood.get(questDetailNeighborhood) ?? null) : null}
                stampedStoreIds={stampedStoreIds}
                onBack={() => {
                  setQuestDetailNeighborhood(null);
                  setQuestMenuOpen(true);
                }}
                onClose={() => setQuestDetailNeighborhood(null)}
                onStoreTap={(storeId) => {
                  setQuestDetailNeighborhood(null);
                  const store = filteredStores.find(s => s.id === storeId);
                  if (store && mapViewRef.current?.flyToStore) {
                    mapViewRef.current.flyToStore(store.latitude, store.longitude, { zoom: 17 });
                  }
                }}
              />

              {/* ── Bottom bar: 3-column grid ──────────────────────────────────
                  Browse mode: [empty] [Radar pill] [List View]
                  Radar mode:  [Trophy/Quest] [Exit pill] [spacer]
                  Grid ensures the center button is always visually centered.
              ──────────────────────────────────────────────────────────── */}
              {!selectedStore && !isSpotlightMode && (
                <div
                  className="absolute left-0 right-0 z-[30] grid grid-cols-3 items-center px-5"
                  style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
                >
                  {/* Left slot: Quest trophy (radar mode) or empty (browse mode) */}
                  <div className="flex justify-start">
                    {isExploreMode && (
                      <button
                        onClick={() => setQuestMenuOpen(true)}
                        className="flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md transition-all duration-200 active:scale-95"
                        style={{
                          backgroundColor: 'rgba(10,10,15,0.85)',
                          border: `2px solid ${hasQuestRow ? 'rgba(245,158,11,0.45)' : 'rgba(255,255,255,0.15)'}`,
                          boxShadow: hasQuestRow
                            ? '0 0 14px rgba(245,158,11,0.25), 0 4px 16px rgba(0,0,0,0.4)'
                            : '0 4px 16px rgba(0,0,0,0.4)',
                          color: hasQuestRow ? '#f59e0b' : 'rgba(255,255,255,0.6)',
                        }}
                        aria-label="Quest menu"
                      >
                        <Trophy className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Center slot: Radar / Exit button (+ onboarding tooltip) */}
                  <div className="flex justify-center relative">
                    {/* Onboarding tooltip — first time only, auto-dismisses after 4s */}
                    {showRadarTooltip && !isExploreMode && (
                      <div
                        className="absolute bottom-full mb-3 px-4 py-2.5 rounded-xl text-xs font-medium text-white backdrop-blur-md pointer-events-none whitespace-nowrap"
                        style={{
                          backgroundColor: 'rgba(10,10,15,0.92)',
                          border: '1px solid rgba(34,217,238,0.4)',
                          boxShadow: '0 0 20px rgba(34,217,238,0.2)',
                        }}
                      >
                        <span style={{ color: '#22D9EE' }}>◎</span>{' '}
                        Tap to discover stores as you walk nearby
                        <div style={{
                          position: 'absolute',
                          bottom: -6,
                          left: '50%',
                          transform: 'translateX(-50%) rotate(45deg)',
                          width: 12,
                          height: 12,
                          backgroundColor: 'rgba(10,10,15,0.92)',
                          borderRight: '1px solid rgba(34,217,238,0.4)',
                          borderBottom: '1px solid rgba(34,217,238,0.4)',
                        }} />
                      </div>
                    )}

                    <button
                      onClick={handleRadarToggle}
                      className="flex items-center gap-2.5 px-5 py-3 rounded-full font-semibold text-sm transition-all duration-300 backdrop-blur-md"
                      style={
                        exitConfirmPending ? {
                          backgroundColor: 'rgba(251,191,36,0.12)',
                          color: '#fbbf24',
                          border: '2px solid rgba(251,191,36,0.6)',
                          boxShadow: '0 0 20px rgba(251,191,36,0.2), 0 4px 16px rgba(0,0,0,0.4)',
                        } : isExploreMode ? {
                          backgroundColor: '#22D9EE',
                          color: '#0a0a0f',
                          border: '2px solid rgba(34,217,238,0.9)',
                          boxShadow: '0 0 24px rgba(34,217,238,0.5), 0 4px 16px rgba(0,0,0,0.4)',
                        } : {
                          backgroundColor: 'rgba(10,10,15,0.85)',
                          color: '#22D9EE',
                          border: '2px solid rgba(34,217,238,0.4)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                        }
                      }
                    >
                      {!exitConfirmPending && (
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
                      )}
                      {exitConfirmPending
                        ? `End session? (${sessionStampCount} stamp${sessionStampCount !== 1 ? 's' : ''})`
                        : isExploreMode ? '← Browse' : 'Radar'
                      }
                    </button>
                  </div>

                  {/* Right slot: List View (browse mode) or spacer (radar mode) */}
                  <div className="flex justify-end">
                    {!isExploreMode && (
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
                    )}
                  </div>
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
              isExploreMode={isExploreMode}
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
