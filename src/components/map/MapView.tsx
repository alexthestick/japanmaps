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
import { Toast } from '../common/Toast';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useToast } from '../../hooks/useToast';
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
}

export interface MapViewHandle {
  flyToStore: (latitude: number, longitude: number) => void;
}

export const MapView = forwardRef<MapViewHandle, MapViewProps>(({ stores, onStoreClick, selectedCity, selectedNeighborhood, isSearchActive = false, activeMainCategory, activeSubCategory, styleMode: controlledStyleMode, onStyleModeChange, tappedStoreId, onLabelClick }, ref) => {
  const [viewState, setViewState] = useState({
    longitude: DEFAULT_CENTER.longitude,
    latitude: DEFAULT_CENTER.latitude,
    zoom: DEFAULT_ZOOM,
  });

  const [hoveredStoreId, setHoveredStoreId] = useState<string | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);

  // User location tracking
  const { position: userPosition, error: locationError, loading: locationLoading, requestLocation } = useGeolocation();
  const { toast, showToast, hideToast } = useToast();

  // Handle locate button click - request location and fly to it
  const handleLocateClick = useCallback(() => {
    requestLocation();
  }, [requestLocation]);

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

    // Hide POI labels that clutter the map
    const layersToHide = [
      'poi-label',
      'transit-label',
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

    console.log('Map POI labels hidden for cleaner appearance');
  }, []);

  return (
    <div className="w-full h-full relative">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
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


      {/* Store Labels - Rendered outside Map component for absolute positioning */}
      {/* PHASE 1.6: Limit to 50 closest stores to viewport center for performance */}
      <div className="absolute inset-0 pointer-events-none">
        {(() => {
          // If there are <= 50 stores, show all labels
          if (stores.length <= 50) {
            return stores.map((store, index) => (
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

          // Calculate map center and sort stores by distance
          const mapCenter = mapRef.current?.getCenter();
          if (!mapCenter) {
            // Fallback: show first 50 stores
            return stores.slice(0, 50).map((store, index) => (
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

          // Take closest 50 stores
          const closestStores = storesWithDistance.slice(0, 50);

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


