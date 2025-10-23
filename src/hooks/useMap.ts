import { useState, useCallback } from 'react';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../lib/mapbox';

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

export function useMap() {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: DEFAULT_CENTER.longitude,
    latitude: DEFAULT_CENTER.latitude,
    zoom: DEFAULT_ZOOM,
  });

  const flyToLocation = useCallback((latitude: number, longitude: number, zoom?: number) => {
    setViewState({
      latitude,
      longitude,
      zoom: zoom || 14,
    });
  }, []);

  const resetView = useCallback(() => {
    setViewState({
      longitude: DEFAULT_CENTER.longitude,
      latitude: DEFAULT_CENTER.latitude,
      zoom: DEFAULT_ZOOM,
    });
  }, []);

  return {
    viewState,
    setViewState,
    flyToLocation,
    resetView,
  };
}


