import { useEffect, useState, useRef, useMemo } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';
import type { Store } from '../../types/store';
import { throttle } from '../../utils/helpers';

interface StoreLabelProps {
  store: Store;
  map: MapboxMap | null;
  isSearchActive: boolean;
  isHovered?: boolean;
  index?: number; // For staggered animation
  activeZoneCenter?: { lng: number; lat: number } | null; // 🎮 DISCOVERY LENS
  activeZoneRadius?: number | null; // 🎮 DISCOVERY LENS
}

export function StoreLabel({ store, map, isSearchActive, isHovered = false, index = 0, activeZoneCenter, activeZoneRadius }: StoreLabelProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(11);
  const [isInViewport, setIsInViewport] = useState<boolean>(true);
  const [isInActiveZone, setIsInActiveZone] = useState<boolean>(true);

  // 🎮 DISCOVERY LENS: Calculate if store is in active zone
  useEffect(() => {
    if (!activeZoneCenter || !activeZoneRadius) {
      setIsInActiveZone(true);
      return;
    }

    // Calculate distance from store to active zone center (Haversine formula)
    const R = 6371000; // Earth radius in meters
    const lat1 = activeZoneCenter.lat * Math.PI / 180;
    const lat2 = store.latitude * Math.PI / 180;
    const deltaLat = (store.latitude - activeZoneCenter.lat) * Math.PI / 180;
    const deltaLng = (store.longitude - activeZoneCenter.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters

    setIsInActiveZone(distance <= activeZoneRadius);
  }, [activeZoneCenter, activeZoneRadius, store.latitude, store.longitude]);

  // 🎬 OPTION 1: Changed threshold to 16 (sync with full pins)
  // 🎮 DISCOVERY LENS: Only show labels in active zone at street level
  const shouldShowLabel = isSearchActive || isHovered || (currentZoom > 16 && isInActiveZone);

  // PHASE 1.2: Create throttled position update function (memoized)
  const throttledUpdatePosition = useMemo(() => {
    if (!map) return () => {};

    const updatePosition = () => {
      // Project lat/lng to screen coordinates
      const point = map.project([store.longitude, store.latitude]);

      // PHASE 1.5: Viewport bounds checking
      const mapContainer = map.getContainer();
      const mapWidth = mapContainer.clientWidth;
      const mapHeight = mapContainer.clientHeight;

      // Check if point is in viewport (with buffer for labels)
      const buffer = 300; // Extra space for label width
      const inViewport =
        point.x >= -buffer &&
        point.x <= mapWidth + buffer &&
        point.y >= -buffer &&
        point.y <= mapHeight + buffer;

      setIsInViewport(inViewport);

      // Only update position if in viewport (saves DOM updates)
      if (inViewport) {
        setPosition({
          x: point.x + 25,
          y: point.y - 20,
        });
      }

      // Update zoom level
      setCurrentZoom(map.getZoom());
    };

    // PHASE 1.2: Throttle to 15fps (67ms) instead of 60fps (16ms)
    // This is 4x fewer calculations!
    return throttle(updatePosition, 67);
  }, [map, store.latitude, store.longitude]);

  useEffect(() => {
    if (!map) return;

    // Initial position calculation (not throttled for instant appearance)
    throttledUpdatePosition();

    // Update position on map events (throttled)
    map.on('move', throttledUpdatePosition);
    map.on('zoom', throttledUpdatePosition);
    map.on('resize', throttledUpdatePosition);

    // Cleanup event listeners on unmount
    return () => {
      map.off('move', throttledUpdatePosition);
      map.off('zoom', throttledUpdatePosition);
      map.off('resize', throttledUpdatePosition);
    };
  }, [map, throttledUpdatePosition]);

  // Don't render if we shouldn't show the label or position isn't calculated yet
  // PHASE 1.5: Also check viewport bounds
  if (!shouldShowLabel || !position || !isInViewport) {
    return null;
  }

  // PHASE 1.3: Cap staggered animation to first 20 labels
  // Labels after 20 appear instantly (0ms delay)
  const animationDelay = index < 20 ? `${index * 50}ms` : '0ms';

  return (
    <div
      className="absolute pointer-events-none whitespace-nowrap animate-in fade-in duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateY(-50%)', // Center vertically
        animationDelay,
      }}
    >
      <div className="bg-white shadow-md rounded-full border border-gray-200 px-3 py-1.5">
        <span className="text-sm font-medium text-gray-900 truncate max-w-48 inline-block">
          {store.name}
        </span>
      </div>
    </div>
  );
}

