import { useState, useCallback, useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { MAPBOX_TOKEN, MAP_STYLE_DAY, MAP_STYLE_NIGHT, DEFAULT_CENTER, DEFAULT_ZOOM } from '../../lib/mapbox';
import { CITY_COORDINATES, NEIGHBORHOOD_COORDINATES, MAIN_CATEGORY_COLORS } from '../../lib/constants';
import { IconStoreMarker } from './IconStoreMarker';
import { MapLegend } from './MapLegend';
import { StoreLabel } from './StoreLabel';
import { MapStyleToggle } from './MapStyleToggle';
import { UserLocationMarker } from './UserLocationMarker';
import { LocateButton } from './LocateButton';
import { SearchAreaButton } from './SearchAreaButton';
import { Toast } from '../common/Toast';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useToast } from '../../hooks/useToast';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useSearchArea } from '../../hooks/useSearchArea';
import type { Store } from '../../types/store';
import type { Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// 🎯 PHASE 1: Marker Tier System for Performance
// Tier 0 (zoom < 12): Tiny glowing dots - atmosphere mode
// Tier 1 (zoom 12-14): Category-colored dots - discovery mode
// Tier 2 (zoom 14-16): Mini pins with icons - exploration mode
// Tier 3 (zoom 16+): Full markers with labels - street level

type MarkerTier = 'atmosphere' | 'discovery' | 'exploration' | 'street';

function getMarkerTier(zoom: number): MarkerTier {
  if (zoom < 12) return 'atmosphere';
  if (zoom < 14) return 'discovery';
  if (zoom < 16) return 'exploration';
  return 'street';
}

// 🎨 Atmosphere Dot Component (Tier 0) - Minimal, glowing presence
const AtmosphereDot = ({ store, onClick }: { store: Store; onClick: (e: any) => void }) => {
  const color = MAIN_CATEGORY_COLORS[store.mainCategory || 'Fashion'] || '#22D9EE';
  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-transform duration-200 hover:scale-150"
      style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: color,
        opacity: 0.7,
        boxShadow: `0 0 6px 2px ${color}40`,
      }}
      title={store.name}
    />
  );
};

// 🎨 Discovery Dot Component (Tier 1) - Category-colored, slightly larger
const DiscoveryDot = ({ store, onClick }: { store: Store; onClick: (e: any) => void }) => {
  const color = MAIN_CATEGORY_COLORS[store.mainCategory || 'Fashion'] || '#22D9EE';
  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-all duration-200 hover:scale-125"
      style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: color,
        border: '2px solid white',
        boxShadow: `0 2px 4px rgba(0,0,0,0.3), 0 0 8px 2px ${color}30`,
      }}
      title={store.name}
    />
  );
};

interface MapViewProps {
  stores: Store[];
  onStoreClick: (store: Store) => void;
  selectedCity?: string | null;
  selectedNeighborhood?: string | null;
  isSearchActive?: boolean;
  activeMainCategory?: string | null;
  activeSubCategory?: string | null;
  styleMode?: 'day' | 'night';
  onStyleModeChange?: (mode: 'day' | 'night') => void;
  tappedStoreId?: string | null; // For mobile two-tap interaction
  onLabelClick?: (store: Store) => void; // Direct click handler for labels
  onSearchArea?: (city: string | null, bounds: { north: number; south: number; east: number; west: number } | null) => void;
  selectedStore?: Store | null; // PHASE 2.2C: Track if store is selected to hide button
}

export interface MapViewHandle {
  flyToStore: (latitude: number, longitude: number) => void;
}

export const MapView = forwardRef<MapViewHandle, MapViewProps>(({ stores, onStoreClick, selectedCity, selectedNeighborhood, isSearchActive = false, activeMainCategory, activeSubCategory, styleMode: controlledStyleMode, onStyleModeChange, tappedStoreId, onLabelClick, onSearchArea, selectedStore }, ref) => {
  const [viewState, setViewState] = useState({
    longitude: DEFAULT_CENTER.longitude,
    latitude: DEFAULT_CENTER.latitude,
    zoom: DEFAULT_ZOOM,
  });

  const [hoveredStoreId, setHoveredStoreId] = useState<string | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const isMobile = useIsMobile();

  // PHASE 1.5G: Track map movement to hide city labels during pan/zoom
  const [isMapMoving, setIsMapMoving] = useState(false);
  const moveTimeoutRef = useRef<NodeJS.Timeout>();

  // PHASE 1.6A: Search Area feature with smart context switching
  const { showSearchButton, hideSearchButton, initializeSearch, getCurrentBounds, detectCurrentCity } = useSearchArea(mapRef);

  // User location tracking
  const { position: userPosition, error: locationError, loading: locationLoading, requestLocation } = useGeolocation();
  const { toast, showToast, hideToast } = useToast();

  // Handle locate button click - request location and fly to it
  const handleLocateClick = useCallback(() => {
    requestLocation();
  }, [requestLocation]);

  // PHASE 1.6A: Handle search area button click - smart context switching
  const handleSearchArea = useCallback(() => {
    const bounds = getCurrentBounds();
    const detectedCity = detectCurrentCity();

    // Hybrid approach: detect if user panned to a different city
    if (detectedCity && detectedCity !== selectedCity) {
      // User panned to a different city - switch city filter
      console.log('Search area: Switching to city', detectedCity);
      onSearchArea?.(detectedCity, null);
    } else {
      // Same city or ambiguous - apply bounds filter
      console.log('Search area: Applying bounds filter', bounds);
      onSearchArea?.(null, bounds);
    }

    hideSearchButton();
  }, [getCurrentBounds, detectCurrentCity, selectedCity, onSearchArea, hideSearchButton]);

  // Fly to user location when position is received
  useEffect(() => {
    if (userPosition && mapRef.current) {
      mapRef.current.flyTo({
        center: [userPosition.longitude, userPosition.latitude],
        zoom: 15,
        duration: 1500,
        essential: true,
      });
      showToast('Location found! 📍', 'success');
    }
  }, [userPosition, showToast]);

  // Show error toast if location fails
  useEffect(() => {
    if (locationError) {
      showToast(locationError.message, 'error');
    }
  }, [locationError, showToast]);

  // PHASE 1.6A: Initialize search area when filters change
  useEffect(() => {
    if (mapRef.current) {
      initializeSearch();
    }
  }, [selectedCity, selectedNeighborhood, activeMainCategory, activeSubCategory, initializeSearch]);

  // 🎮 DISCOVERY LENS: Active Zone System
  const activeZoneCenter = useMemo(() => {
    if (!mapRef.current) return null;
    const center = mapRef.current.getCenter();
    return { lng: center.lng, lat: center.lat };
  }, [viewState.longitude, viewState.latitude]);

  // Calculate adaptive radius based on store density
  // 🎬 OPTION 1: Activate at zoom 16 (sync with full pins)
  const calculateActiveZoneRadius = useMemo(() => {
    // Only activate at street-level zoom (> 16)
    if (viewState.zoom <= 16) return null;

    // Count stores in viewport
    if (!mapRef.current) return 500; // Default 500m

    const bounds = mapRef.current.getBounds();
    const storesInView = stores.filter(store => {
      return store.latitude >= bounds.getSouth() &&
             store.latitude <= bounds.getNorth() &&
             store.longitude >= bounds.getWest() &&
             store.longitude <= bounds.getEast();
    });

    const density = storesInView.length;

    // Dense area (40+ stores): 300m radius
    // Medium area (20-40 stores): 500m radius
    // Sparse area (< 20 stores): 800m radius
    if (density >= 40) return 300;
    if (density >= 20) return 500;
    return 800;
  }, [stores, viewState]);

  // 🎬 OPTION 4: Progressive glow intensity (15-16 = subtle hint, 16+ = full)
  const lensIntensity = useMemo(() => {
    if (viewState.zoom < 15) return 0;
    if (viewState.zoom >= 16) return 1;
    // Gradual fade-in between 15-16
    return (viewState.zoom - 15) / 1; // 0 to 1
  }, [viewState.zoom]);

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

  const [uncontrolledStyleMode, setUncontrolledStyleMode] = useState<'day' | 'night'>(getInitialStyleMode);
  const styleMode = controlledStyleMode ?? uncontrolledStyleMode;

  // Listen for style mode changes from header toggle
  useEffect(() => {
    const handleStyleModeChange = () => {
      const newMode = getInitialStyleMode();
      setUncontrolledStyleMode(newMode);
    };

    window.addEventListener('mapStyleModeChanged', handleStyleModeChange);
    return () => window.removeEventListener('mapStyleModeChanged', handleStyleModeChange);
  }, []);

  const prevStoresIds = useRef<string>('');
  const prevSelectedCity = useRef<string | null>(null);
  const prevSelectedNeighborhood = useRef<string | null>(null);
  const isInitialLoad = useRef<boolean>(true);

  // Auto-zoom to neighborhood when neighborhood filter is selected (priority over city)
  useEffect(() => {
    if (selectedNeighborhood && selectedNeighborhood !== prevSelectedNeighborhood.current) {
      prevSelectedNeighborhood.current = selectedNeighborhood;

      const neighborhoodCoords = NEIGHBORHOOD_COORDINATES[selectedNeighborhood];
      if (neighborhoodCoords) {
        console.log('Zooming to neighborhood:', selectedNeighborhood, neighborhoodCoords);
        setViewState({
          longitude: neighborhoodCoords.longitude,
          latitude: neighborhoodCoords.latitude,
          zoom: neighborhoodCoords.zoom,
        });
        return; // Don't also zoom to city
      }
    } else if (!selectedNeighborhood && prevSelectedNeighborhood.current) {
      // Neighborhood was cleared
      prevSelectedNeighborhood.current = null;
    }
  }, [selectedNeighborhood]);

  // Auto-zoom to city when city filter is selected (even if no stores)
  useEffect(() => {
    // Skip if we just zoomed to a neighborhood
    if (selectedNeighborhood) return;

    if (selectedCity && selectedCity !== prevSelectedCity.current) {
      prevSelectedCity.current = selectedCity;

      const cityCoords = CITY_COORDINATES[selectedCity];
      if (cityCoords) {
        console.log('Zooming to city:', selectedCity, cityCoords);
        setViewState({
          longitude: cityCoords.longitude,
          latitude: cityCoords.latitude,
          zoom: cityCoords.zoom,
        });
      }
    } else if (!selectedCity && prevSelectedCity.current) {
      // Reset to default when city filter is cleared
      prevSelectedCity.current = null;
    }
  }, [selectedCity, selectedNeighborhood]);

  // Auto-zoom to stores when search results change
  useEffect(() => {
    if (stores.length === 0) return;
    
    // Create a unique ID string from store IDs to detect when results actually change
    const currentStoresIds = stores.map(s => s.id).sort().join(',');
    
    // Skip auto-zoom ONLY on initial page load with all stores (not when searching)
    if (isInitialLoad.current && stores.length > 1 && !isSearchActive) {
      isInitialLoad.current = false;
      prevStoresIds.current = currentStoresIds;
      return;
    }
    
    // Mark as no longer initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
    
    // Only auto-zoom when the actual stores change (not just re-render)
    if (currentStoresIds !== prevStoresIds.current) {
      prevStoresIds.current = currentStoresIds;
      
      // For search queries or single store results, ALWAYS zoom (override city filter)
      // For multiple stores without search, respect city filter
      
      if (stores.length === 1) {
        // Single store: ALWAYS zoom (search result or click)
        console.log('Zooming to single store:', stores[0].name, stores[0].latitude, stores[0].longitude);
        setViewState({
          longitude: stores[0].longitude,
          latitude: stores[0].latitude,
          zoom: 15, // Close zoom for single store
        });
      } else if (stores.length > 1) {
        // Multiple stores: zoom if search is active (NOT neighborhood - we already zoomed via coordinates)
        // When changing category filter, stay at current location (don't auto-zoom)
        const shouldZoom = isSearchActive;

        if (shouldZoom) {
          // Calculate bounds and fit all stores in view
          const lngs = stores.map(s => s.longitude);
          const lats = stores.map(s => s.latitude);
          
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          
          const centerLng = (minLng + maxLng) / 2;
          const centerLat = (minLat + maxLat) / 2;
          
          // Calculate appropriate zoom level based on bounds
          const lngDiff = maxLng - minLng;
          const latDiff = maxLat - minLat;
          const maxDiff = Math.max(lngDiff, latDiff);
          
          let zoom = 12; // Default for neighborhood
          if (maxDiff > 0.5) zoom = 10; // City level
          else if (maxDiff > 0.2) zoom = 11; // District level
          else if (maxDiff < 0.05) zoom = 14; // Very close stores
          
          console.log('Zooming to multiple stores:', stores.length, 'at zoom', zoom);
          setViewState({
            longitude: centerLng,
            latitude: centerLat,
            zoom,
          });
        }
      }
    }
  }, [stores, isSearchActive, selectedCity, selectedNeighborhood]);

  const handleMarkerClick = useCallback((e: any, store: Store) => {
    e.originalEvent.stopPropagation();
    console.log('Marker clicked:', store.name);
    onStoreClick(store);
  }, [onStoreClick]);

  // Expose flyToStore method via ref
  useImperativeHandle(ref, () => ({
    flyToStore: (latitude: number, longitude: number) => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: 16,
          duration: 1500,
          essential: true
        });
      }
    }
  }), []);

  // Debug logging (disabled for production performance)
  // console.log('MapView received stores:', stores.length);

  // Show message if no Mapbox token
  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Mapbox Token Required
          </h3>
          <p className="text-gray-600 mb-4">
            Please add your Mapbox token to the .env.local file
          </p>
          <p className="text-sm text-gray-500">
            Get your token at: <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">account.mapbox.com</a>
          </p>
        </div>
      </div>
    );
  }

  // Persist user preference for style mode
  useEffect(() => {
    try {
      localStorage.setItem('map-style-mode', styleMode);
    } catch {}
  }, [styleMode]);

  // Filter out POI labels when map loads to reduce clutter
  const handleMapLoad = useCallback(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Wait for style to load
    if (!map.isStyleLoaded()) {
      map.once('styledata', () => handleMapLoad());
      return;
    }

    // Hide POI labels that clutter the map (except transit stations - Phase 1.5B)
    const layersToHide = [
      'poi-label',
      // 'transit-label', // 🚉 PHASE 1.5B: Keep transit stations visible for navigation
      'airport-label',
      'settlement-subdivision-label',
      'natural-point-label',
      'natural-line-label',
      'water-point-label',
      'water-line-label',
      'waterway-label',
      'poi'
    ];

    layersToHide.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', 'none');
      }
    });

    console.log('Map labels configured: POI hidden, transit stations visible');

    // PHASE 2.2: Initialize search area tracking on map load
    initializeSearch();
  }, [initializeSearch]);

  // PHASE 1.5G: Handle map movement - hide city labels during pan/zoom
  const handleMapMove = useCallback((evt: any) => {
    setViewState(evt.viewState);

    // Hide city labels immediately when map starts moving
    setIsMapMoving(true);

    // Clear existing timeout
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }

    // Show city labels after 500ms of idle time
    moveTimeoutRef.current = setTimeout(() => {
      setIsMapMoving(false);
    }, 500);
  }, []);

  return (
    <div className="w-full h-full relative">
      <Map
        {...viewState}
        onMove={handleMapMove}
        mapStyle={styleMode === 'day' ? MAP_STYLE_DAY : MAP_STYLE_NIGHT}
        mapboxAccessToken={MAPBOX_TOKEN}
        onLoad={handleMapLoad}
        ref={(ref) => {
          if (ref) {
            mapRef.current = ref.getMap();
          }
        }}
      >
        <NavigationControl position="top-right" />

        {/* 🎯 PHASE 1: Optimized Store Markers with Viewport Culling + Tiered Rendering */}
        {(() => {
          const currentTier = getMarkerTier(viewState.zoom);

          // 🔹 Viewport Culling: Only render markers in visible bounds (with buffer)
          const bounds = mapRef.current?.getBounds();
          const buffer = 0.01; // ~1km buffer to prevent pop-in

          const visibleStores = bounds
            ? stores.filter(store => {
                return store.latitude >= bounds.getSouth() - buffer &&
                       store.latitude <= bounds.getNorth() + buffer &&
                       store.longitude >= bounds.getWest() - buffer &&
                       store.longitude <= bounds.getEast() + buffer;
              })
            : stores;

          // 🔹 Limit markers at very low zoom for performance
          const maxMarkers = currentTier === 'atmosphere' ? 200 :
                            currentTier === 'discovery' ? 150 :
                            currentTier === 'exploration' ? 100 : 80;

          const markersToRender = visibleStores.slice(0, maxMarkers);

          return markersToRender.map(store => (
            <Marker
              key={store.id}
              longitude={store.longitude}
              latitude={store.latitude}
              anchor={currentTier === 'atmosphere' || currentTier === 'discovery' ? 'center' : 'bottom'}
              onClick={e => handleMarkerClick(e, store)}
            >
              {/* Render different marker types based on zoom tier */}
              {currentTier === 'atmosphere' ? (
                <AtmosphereDot store={store} onClick={(e) => handleMarkerClick(e, store)} />
              ) : currentTier === 'discovery' ? (
                <DiscoveryDot store={store} onClick={(e) => handleMarkerClick(e, store)} />
              ) : (
                <IconStoreMarker
                  store={store}
                  activeFilter={activeSubCategory}
                  activeMainCategory={activeMainCategory}
                  onHoverChange={setHoveredStoreId}
                  currentZoom={viewState.zoom}
                />
              )}
            </Marker>
          ));
        })()}

        {/* User Location Marker */}
        {userPosition && (
          <Marker
            longitude={userPosition.longitude}
            latitude={userPosition.latitude}
            anchor="center"
          >
            <UserLocationMarker accuracy={userPosition.accuracy} />
          </Marker>
        )}
      </Map>

      {/* Map style toggle - Removed: Now only controlled by header */}
      {/* Map Legend - Removed: Now using FloatingMapLegend in HomePage */}

      {/* 🎮 DISCOVERY LENS: Progressive glow with dramatic entrance */}
      {lensIntensity > 0 && activeZoneCenter && mapRef.current && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {(() => {
            const centerPoint = mapRef.current!.project([activeZoneCenter.lng, activeZoneCenter.lat]);

            // Calculate radius - if no active zone yet (zoom 15-16), use default for hint
            const radiusMeters = calculateActiveZoneRadius || 500;
            const metersToPixels = (radiusMeters / 1000) * (156543.03392 * Math.cos(activeZoneCenter.lat * Math.PI / 180) / Math.pow(2, viewState.zoom));

            // 🎬 Subtle hint at zoom 15, full glow at zoom 16+
            const isFullMode = lensIntensity >= 1;

            return (
              <>
                {/* Main lens glow */}
                <div
                  className={`absolute ${isFullMode ? 'animate-in zoom-in-50 duration-500' : ''} ${isFullMode ? 'animate-pulse' : ''}`}
                  style={{
                    left: `${centerPoint.x}px`,
                    top: `${centerPoint.y}px`,
                    width: `${metersToPixels * 2}px`,
                    height: `${metersToPixels * 2}px`,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, rgba(34, 217, 238, ${0.15 * lensIntensity}) 0%, rgba(59, 130, 246, ${0.1 * lensIntensity}) 40%, rgba(168, 85, 247, ${0.05 * lensIntensity}) 70%, transparent 100%)`,
                    boxShadow: isFullMode ? `
                      0 0 60px 20px rgba(34, 217, 238, ${0.3 * lensIntensity}),
                      0 0 100px 40px rgba(59, 130, 246, ${0.2 * lensIntensity}),
                      0 0 140px 60px rgba(168, 85, 247, ${0.1 * lensIntensity}),
                      inset 0 0 60px rgba(34, 217, 238, ${0.1 * lensIntensity})
                    ` : `0 0 40px 10px rgba(200, 200, 200, ${0.2 * lensIntensity})`,
                    border: `2px solid rgba(${isFullMode ? '34, 217, 238' : '200, 200, 200'}, ${0.3 * lensIntensity})`,
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: lensIntensity,
                  }}
                >
                  {/* Inner glow ring - only in full mode */}
                  {isFullMode && (
                    <div
                      className="absolute inset-0 rounded-full animate-pulse"
                      style={{
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        animationDelay: '0.3s',
                        animationDuration: '2s',
                      }}
                    />
                  )}
                </div>

                {/* 🎬 Cyan flash on activation (appears once at zoom 16) */}
                {isFullMode && viewState.zoom >= 16 && viewState.zoom < 16.1 && (
                  <div
                    className="absolute animate-in fade-in duration-300"
                    style={{
                      left: `${centerPoint.x}px`,
                      top: `${centerPoint.y}px`,
                      width: `${metersToPixels * 2.2}px`,
                      height: `${metersToPixels * 2.2}px`,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(34, 217, 238, 0.4) 0%, transparent 60%)',
                      animation: 'flash-fade 0.8s ease-out forwards',
                    }}
                  />
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* 🏙️ PHASE 1.6A: City Labels (Zoom < 8) - Country View with Collision Detection */}
      {viewState.zoom < 8 && mapRef.current && !isMapMoving && (
        <div className="absolute inset-0 pointer-events-none">
          {(() => {
            // Show all cities from database (18 total cities across Japan)
            const majorCities = [
              'Tokyo', 'Osaka', 'Kyoto', 'Fukuoka', 'Nagoya', 'Sapporo',
              'Kanagawa / Yokohama', 'Hiroshima', 'Kanazawa', 'Kobe',
              'Niigata', 'Chiba', 'Takamatsu', 'Fukushima', 'Okayama',
              'Kojima', 'Nagano', 'Toyama'
            ];

            // PHASE 1.6A: Collision detection for city labels
            const selectedCityLabels: Array<{ cityName: string; point: { x: number; y: number }; fontSize: number; padding: string }> = [];

            majorCities.forEach(cityName => {
              const coords = CITY_COORDINATES[cityName];
              if (!coords) return;

              const point = mapRef.current!.project([coords.longitude, coords.latitude]);

              // Check if city is in viewport
              const mapContainer = mapRef.current!.getContainer();
              const inViewport =
                point.x >= 0 && point.x <= mapContainer.clientWidth &&
                point.y >= 0 && point.y <= mapContainer.clientHeight;

              if (!inViewport) return;

              const baseFontSize = 14;
              const fontSize = Math.max(10, Math.min(14, baseFontSize * (viewState.zoom / 7)));
              const padding = fontSize >= 13 ? '6px 12px' : '5px 10px';

              // Estimate label dimensions (rough approximation)
              const estimatedWidth = cityName.length * fontSize * 0.6 + 24; // 0.6 is avg char width ratio
              const estimatedHeight = fontSize + 12; // padding

              // Check collision with already selected labels (100px minimum spacing)
              const hasCollision = selectedCityLabels.some(selected => {
                const dx = Math.abs(point.x - selected.point.x);
                const dy = Math.abs(point.y - selected.point.y);
                // Use larger of the two label dimensions for spacing
                const minSpacing = 80;
                return dx < minSpacing && dy < minSpacing;
              });

              if (!hasCollision) {
                selectedCityLabels.push({ cityName, point, fontSize, padding });
              }
            });

            return selectedCityLabels.map(({ cityName, point, fontSize, padding }) => (
              <div
                key={cityName}
                className="absolute animate-in fade-in duration-300"
                style={{
                  left: `${point.x}px`,
                  top: `${point.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  style={{
                    fontSize: `${fontSize}px`,
                    fontWeight: '600',
                    color: '#1F2937',
                    padding,
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.3px',
                    textTransform: 'lowercase',
                    boxShadow: styleMode === 'night' ? '0 2px 12px rgba(0, 0, 0, 0.6)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {cityName.toLowerCase()}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* 🏙️ PHASE 1.5E: Fixed Neighborhood Labels (Zoom 12-14) */}
      {/* Show 2 zoom levels before icons appear (icons start at zoom 14) */}
      {/* Store density filtering - 20+ stores minimum */}
      {/* Priority + distance hybrid with collision detection (150px spacing) */}
      {/* Max 3 mobile, 4 desktop labels */}
      {viewState.zoom >= 12 && viewState.zoom < 14 && mapRef.current && (
        <div className="absolute inset-0 pointer-events-none">
          {(() => {
            // PHASE 1.5D-4: Count stores per neighborhood with stricter criteria
            const neighborhoodStoreCounts: Record<string, number> = {};

            Object.keys(NEIGHBORHOOD_COORDINATES).forEach(neighborhoodName => {
              const coords = NEIGHBORHOOD_COORDINATES[neighborhoodName];
              // PHASE 1.5D-4: Increased radius to 0.015 degrees (~1.5km) for better coverage
              const nearbyStores = stores.filter(store => {
                const latDiff = Math.abs(store.latitude - coords.latitude);
                const lngDiff = Math.abs(store.longitude - coords.longitude);
                return latDiff < 0.015 && lngDiff < 0.015;
              });
              neighborhoodStoreCounts[neighborhoodName] = nearbyStores.length;
            });

            // PHASE 1.5D-4: Filter to only neighborhoods with 20+ stores (was 10)
            const relevantNeighborhoods = Object.entries(NEIGHBORHOOD_COORDINATES).filter(
              ([name]) => neighborhoodStoreCounts[name] >= 20
            );

            // Calculate distance to map center and sort
            const mapCenter = mapRef.current!.getCenter();
            const neighborhoodsWithDistance = relevantNeighborhoods.map(([name, coords]) => {
              const dx = coords.longitude - mapCenter.lng;
              const dy = coords.latitude - mapCenter.lat;
              const distance = Math.sqrt(dx * dx + dy * dy);
              return { name, coords, distance };
            });

            // Sort by distance (closest first)
            neighborhoodsWithDistance.sort((a, b) => a.distance - b.distance);

            // PHASE 1.5D-5: Collision detection - 150px minimum spacing
            // PHASE 1.5D-6: Max 3 mobile, 4 desktop (was 5/8)
            const maxLabels = isMobile ? 3 : 4;
            const selectedNeighborhoods: Array<{ name: string; coords: typeof NEIGHBORHOOD_COORDINATES[string]; distance: number; point: { x: number; y: number } }> = [];

            for (const neighborhood of neighborhoodsWithDistance) {
              if (selectedNeighborhoods.length >= maxLabels) break;

              const point = mapRef.current!.project([neighborhood.coords.longitude, neighborhood.coords.latitude]);

              // Check if this label would collide with any already-selected labels
              const hasCollision = selectedNeighborhoods.some(selected => {
                const dx = point.x - selected.point.x;
                const dy = point.y - selected.point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < 150; // 150px minimum spacing
              });

              if (!hasCollision) {
                selectedNeighborhoods.push({ ...neighborhood, point });
              }
            }

            return selectedNeighborhoods.map(({ name, coords, point }) => {
              // Check if neighborhood is in viewport
              const mapContainer = mapRef.current!.getContainer();
              const inViewport =
                point.x >= 0 && point.x <= mapContainer.clientWidth &&
                point.y >= 0 && point.y <= mapContainer.clientHeight;

              if (!inViewport) return null;

              // PHASE 1.5E: No fade needed - labels disappear at zoom 14 when icons appear
              const opacity = 1;

              // PHASE 1.5E: Fixed small size - 10px font, stays constant across all zoom levels
              const fontSize = 10;
              const padding = '4px 8px';

              return (
                <div
                  key={name}
                  className="absolute transition-opacity duration-200"
                  style={{
                    left: `${point.x}px`,
                    top: `${point.y}px`,
                    transform: 'translate(-50%, -50%)',
                    opacity,
                  }}
                >
                  <div
                    style={{
                      fontSize: `${fontSize}px`,
                      fontWeight: '600',
                      color: '#FCD34D',
                      textShadow: '0 1px 8px rgba(0,0,0,0.8)',
                      padding,
                      background: 'rgba(0, 0, 0, 0.35)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(252, 211, 77, 0.15)',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.2px',
                    }}
                  >
                    {name}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Store Labels - Rendered outside Map component for absolute positioning */}
      {/* PHASE 1.5A: Optimized label limits - 8-10 on mobile, 15 on desktop */}
      <div className="absolute inset-0 pointer-events-none">
        {(() => {
          // 🎯 PHASE 1.5A: Responsive label limits
          const maxLabels = isMobile ? 10 : 15;

          // Calculate map center and sort stores by distance
          const mapCenter = mapRef.current?.getCenter();
          if (!mapCenter) {
            // Fallback: show limited stores
            return stores.slice(0, maxLabels).map((store, index) => (
              <StoreLabel
                key={`label-${store.id}`}
                store={store}
                map={mapRef.current}
                isSearchActive={isSearchActive}
                isHovered={hoveredStoreId === store.id || tappedStoreId === store.id}
                index={index}
                activeZoneCenter={activeZoneCenter}
                activeZoneRadius={calculateActiveZoneRadius}
                onClick={onLabelClick}
              />
            ));
          }

          // Sort stores by distance to map center (closest first)
          const storesWithDistance = stores.map(store => {
            const dx = store.longitude - mapCenter.lng;
            const dy = store.latitude - mapCenter.lat;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return { store, distance };
          });

          storesWithDistance.sort((a, b) => a.distance - b.distance);

          // 🎯 Take closest stores based on device - updates dynamically as user pans
          const closestStores = storesWithDistance.slice(0, maxLabels);

          return closestStores.map(({ store }, index) => (
            <StoreLabel
              key={`label-${store.id}`}
              store={store}
              map={mapRef.current}
              isSearchActive={isSearchActive}
              isHovered={hoveredStoreId === store.id || tappedStoreId === store.id}
              index={index}
              activeZoneCenter={activeZoneCenter}
              activeZoneRadius={calculateActiveZoneRadius}
              onClick={onLabelClick}
            />
          ));
        })()}
      </div>

      {/* Locate Me Button */}
      <LocateButton
        onClick={handleLocateClick}
        loading={locationLoading}
        hasLocation={!!userPosition}
      />

      {/* PHASE 2.2: Search This Area Button - Movement-based, zoom >= 14 only */}
      {showSearchButton && !selectedStore && viewState.zoom >= 14 && (
        <SearchAreaButton
          onClick={handleSearchArea}
        />
      )}

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
});

MapView.displayName = 'MapView';


