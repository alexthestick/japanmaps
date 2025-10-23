import { useEffect, useState } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';
import type { Store } from '../../types/store';

interface StoreLabelProps {
  store: Store;
  map: MapboxMap | null;
  isSearchActive: boolean;
  isHovered?: boolean;
  index?: number; // For staggered animation
}

export function StoreLabel({ store, map, isSearchActive, isHovered = false, index = 0 }: StoreLabelProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(11);

  // Determine if label should be visible
  const shouldShowLabel = isSearchActive || currentZoom > 14 || isHovered;

  useEffect(() => {
    if (!map) return;

    // Function to update label position based on map coordinates
    const updatePosition = () => {
      // Project lat/lng to screen coordinates
      const point = map.project([store.longitude, store.latitude]);
      
      // Position label to the RIGHT of pin (x + 25px offset)
      // Center vertically with pin (no y offset since pin anchor is bottom)
      setPosition({
        x: point.x + 25,
        y: point.y - 20, // Slight upward offset to align with pin center
      });

      // Update zoom level
      setCurrentZoom(map.getZoom());
    };

    // Initial position calculation
    updatePosition();

    // Update position on map events
    map.on('move', updatePosition);
    map.on('zoom', updatePosition);
    map.on('resize', updatePosition);

    // Cleanup event listeners on unmount
    return () => {
      map.off('move', updatePosition);
      map.off('zoom', updatePosition);
      map.off('resize', updatePosition);
    };
  }, [map, store.latitude, store.longitude]);

  // Don't render if we shouldn't show the label or position isn't calculated yet
  if (!shouldShowLabel || !position) {
    return null;
  }

  // Calculate animation delay for staggered effect
  const animationDelay = `${index * 50}ms`;

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

