import { useState, useCallback, useEffect, useRef } from 'react';
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
}

export function MapView({ stores, onStoreClick, selectedCity, selectedNeighborhood, isSearchActive = false, activeMainCategory, activeSubCategory, styleMode: controlledStyleMode, onStyleModeChange }: MapViewProps) {
  const [viewState, setViewState] = useState({
    longitude: DEFAULT_CENTER.longitude,
    latitude: DEFAULT_CENTER.latitude,
    zoom: DEFAULT_ZOOM,
  });
  
  const [hoveredStoreId, setHoveredStoreId] = useState<string | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
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
    onStoreClick(store);
  }, [onStoreClick]);

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
        
        {/* Store Markers */}
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
            />
          </Marker>
        ))}
      </Map>

      {/* Map style toggle - Removed: Now only controlled by header */}
      {/* Map Legend - Removed: Now using FloatingMapLegend in HomePage */}

      {/* Store Labels - Rendered outside Map component for absolute positioning */}
      <div className="absolute inset-0 pointer-events-none">
        {stores.map((store, index) => (
          <StoreLabel
            key={`label-${store.id}`}
            store={store}
            map={mapRef.current}
            isSearchActive={isSearchActive}
            isHovered={hoveredStoreId === store.id}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}


