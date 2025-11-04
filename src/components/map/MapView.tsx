import { useState, useCallback, useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { MAPBOX_TOKEN, MAP_STYLE_DAY, MAP_STYLE_NIGHT, DEFAULT_CENTER, DEFAULT_ZOOM } from '../../lib/mapbox';
import { CITY_COORDINATES } from '../../lib/constants';
import { IconStoreMarker } from './IconStoreMarker';
import { MapLegend } from './MapLegend';
import { StoreLabel } from './StoreLabel';
import { MapStyleToggle } from './MapStyleToggle';
import type { Store } from '../../types/store';
import type { Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
}

export interface MapViewHandle {
  flyToStore: (latitude: number, longitude: number) => void;
}

export const MapView = forwardRef<MapViewHandle, MapViewProps>(({ stores, onStoreClick, selectedCity, selectedNeighborhood, isSearchActive = false, activeMainCategory, activeSubCategory, styleMode: controlledStyleMode, onStyleModeChange, tappedStoreId }, ref) => {
  const [viewState, setViewState] = useState({
    longitude: DEFAULT_CENTER.longitude,
    latitude: DEFAULT_CENTER.latitude,
    zoom: DEFAULT_ZOOM,
  });

  const [hoveredStoreId, setHoveredStoreId] = useState<string | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);

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
  const isInitialLoad = useRef<boolean>(true);

  // Auto-zoom to city when city filter is selected (even if no stores)
  useEffect(() => {
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
  }, [selectedCity]);

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
        // Multiple stores: zoom if search is active OR neighborhood is selected
        // When changing category filter, stay at current location (don't auto-zoom)
        const shouldZoom = isSearchActive || selectedNeighborhood;

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

  // Debug logging
  console.log('MapView received stores:', stores);
  console.log('Store count in MapView:', stores.length);
  if (stores.length > 0) {
    console.log('First store in MapView:', {
      name: stores[0].name,
      lat: stores[0].latitude,
      lng: stores[0].longitude,
      categories: stores[0].categories,
    });
  }

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

  return (
    <div className="w-full h-full relative">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={styleMode === 'day' ? MAP_STYLE_DAY : MAP_STYLE_NIGHT}
        mapboxAccessToken={MAPBOX_TOKEN}
        ref={(ref) => {
          if (ref) {
            mapRef.current = ref.getMap();
          }
        }}
      >
        <NavigationControl position="top-right" />

        {/* Store Markers - All visible with zoom-based rendering */}
        {stores.map(store => (
          <Marker
            key={store.id}
            longitude={store.longitude}
            latitude={store.latitude}
            anchor="bottom"
            onClick={e => handleMarkerClick(e, store)}
          >
            <IconStoreMarker
              store={store}
              activeFilter={activeSubCategory}
              activeMainCategory={activeMainCategory}
              onHoverChange={setHoveredStoreId}
              currentZoom={viewState.zoom}
            />
          </Marker>
        ))}
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
            />
          ));
        })()}
      </div>
    </div>
  );
});

MapView.displayName = 'MapView';


