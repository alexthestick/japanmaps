import { useState, useCallback, useEffect, useRef } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface SearchAreaState {
  initialCenter: { lat: number; lng: number } | null;
  initialZoom: number | null;
}

export function useSearchArea(mapRef: React.RefObject<MapboxMap | null>) {
  const [showButton, setShowButton] = useState(false);
  const searchState = useRef<SearchAreaState>({
    initialCenter: null,
    initialZoom: null
  });

  // PHASE 2.2A: Instant trigger thresholds
  const DISTANCE_THRESHOLD = 0.01; // 1% of viewport (basically any pan)
  const ZOOM_THRESHOLD = 0.1; // 0.1 zoom levels (any zoom)
  const DEBOUNCE_MS = 300; // 300ms for instant feel

  const debounceTimer = useRef<NodeJS.Timeout>();

  /**
   * Initialize search state (call this after applying filters)
   */
  const initializeSearch = useCallback(() => {
    if (!mapRef.current) return;

    const center = mapRef.current.getCenter();

    searchState.current = {
      initialCenter: { lat: center.lat, lng: center.lng },
      initialZoom: mapRef.current.getZoom()
    };

    setShowButton(false);
  }, [mapRef]);

  /**
   * Check if button should be shown based on map movement
   */
  const checkShouldShowButton = useCallback(() => {
    if (!mapRef.current || !searchState.current.initialCenter) return;

    const currentCenter = mapRef.current.getCenter();
    const currentZoom = mapRef.current.getZoom();
    const bounds = mapRef.current.getBounds();

    // Calculate distance moved from initial position
    const latDiff = currentCenter.lat - searchState.current.initialCenter.lat;
    const lngDiff = currentCenter.lng - searchState.current.initialCenter.lng;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

    const viewportWidth = bounds.getEast() - bounds.getWest();
    const hasMovedSignificantly = distance > (viewportWidth * DISTANCE_THRESHOLD);

    // Calculate zoom change
    const zoomDiff = Math.abs(currentZoom - (searchState.current.initialZoom || 0));
    const hasZoomedSignificantly = zoomDiff >= ZOOM_THRESHOLD;

    if (hasMovedSignificantly || hasZoomedSignificantly) {
      setShowButton(true);
    }
  }, [mapRef]);

  /**
   * Handle map movement - debounced check
   */
  const handleMapMove = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      checkShouldShowButton();
    }, DEBOUNCE_MS);
  }, [checkShouldShowButton]);

  /**
   * Get current map bounds
   */
  const getCurrentBounds = useCallback((): MapBounds | null => {
    if (!mapRef.current) return null;

    const bounds = mapRef.current.getBounds();
    return {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };
  }, [mapRef]);

  /**
   * Detect which city the map is currently centered on
   */
  const detectCurrentCity = useCallback((): string | null => {
    if (!mapRef.current) return null;

    const center = mapRef.current.getCenter();

    // City centers from constants
    const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
      'Tokyo': { lat: 35.6895, lng: 139.6917 },
      'Osaka': { lat: 34.6937, lng: 135.5023 },
      'Kyoto': { lat: 35.0116, lng: 135.7681 },
      'Fukuoka': { lat: 33.5904, lng: 130.4017 },
      'Nagoya': { lat: 35.1815, lng: 136.9066 },
      'Sapporo': { lat: 43.0642, lng: 141.3469 },
      'Kanagawa / Yokohama': { lat: 35.4437, lng: 139.6380 },
      'Hiroshima': { lat: 34.3853, lng: 132.4553 },
      'Kanazawa': { lat: 36.5611, lng: 136.6564 },
      'Kobe': { lat: 34.6901, lng: 135.1955 },
    };

    let closestCity: string | null = null;
    let minDistance = Infinity;

    for (const [city, coords] of Object.entries(CITY_CENTERS)) {
      const latDiff = center.lat - coords.lat;
      const lngDiff = center.lng - coords.lng;
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

      // Within ~50km radius (roughly 0.5 degrees)
      if (distance < minDistance && distance < 0.5) {
        minDistance = distance;
        closestCity = city;
      }
    }

    return closestCity;
  }, [mapRef]);

  // Set up event listeners
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.on('moveend', handleMapMove);
    map.on('zoomend', handleMapMove);

    return () => {
      map.off('moveend', handleMapMove);
      map.off('zoomend', handleMapMove);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [mapRef, handleMapMove]);

  return {
    showSearchButton: showButton,
    hideSearchButton: () => setShowButton(false),
    initializeSearch,
    getCurrentBounds,
    detectCurrentCity
  };
}
