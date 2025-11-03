import React from 'react';
import { MAIN_CATEGORY_COLORS, MAIN_CATEGORY_ICONS } from '../../lib/constants';
import type { Store } from '../../types/store';
import { Shirt, UtensilsCrossed, Coffee, Home, Building2, LucideIcon } from 'lucide-react';

interface IconStoreMarkerProps {
  store: Store;
  activeFilter?: string | null; // Active sub-category filter
  activeMainCategory?: string | null; // Currently selected main category filter
  onHoverChange?: (storeId: string | null) => void;
  currentZoom: number; // 🎮 DISCOVERY LENS: Zoom level for adaptive rendering
}

// PHASE 2.5: Memoize to prevent unnecessary re-renders
export const IconStoreMarker = React.memo(({ store, activeFilter, activeMainCategory, onHoverChange, currentZoom }: IconStoreMarkerProps) => {
  // Default to 'Fashion' if mainCategory not set yet (before migration)
  const mainCategory = store.mainCategory || 'Fashion';

  // 🎬 OPTION 4: Smooth continuous scaling instead of discrete steps
  const getMarkerScale = () => {
    // Zoom < 13: Tiny dot (8px)
    if (currentZoom < 13) return { size: 8, type: 'dot' as const };

    // Zoom 13-16: Smoothly scale from 24px to 48px
    if (currentZoom < 16) {
      const progress = (currentZoom - 13) / 3; // 0 to 1 over 3 zoom levels
      const size = 24 + (progress * 24); // 24px → 48px
      return { size: Math.round(size), type: 'pin' as const };
    }

    // Zoom >= 16: Full size (48px)
    return { size: 48, type: 'pin' as const };
  };

  const markerScale = getMarkerScale();

  // Determine pin color based on main category only (no subcategory colors)
  const getPinColor = (): string => {
    // Always use main category color for clean, consistent map appearance
    return MAIN_CATEGORY_COLORS[mainCategory];
  };

  const getIconComponent = (): LucideIcon => {
    const iconName = MAIN_CATEGORY_ICONS[mainCategory];
    const iconMap: Record<string, LucideIcon> = {
      'Shirt': Shirt,
      'UtensilsCrossed': UtensilsCrossed,
      'Coffee': Coffee,
      'Home': Home,
      'Building2': Building2,
    };
    return iconMap[iconName] || Shirt;
  };

  const color = getPinColor();
  const IconComponent = getIconComponent();

  const handleMouseEnter = () => {
    if (onHoverChange) {
      onHoverChange(store.id);
    }
  };

  const handleMouseLeave = () => {
    if (onHoverChange) {
      onHoverChange(null);
    }
  };

  // 🎬 TINY DOT rendering (zoom < 13)
  if (markerScale.type === 'dot') {
    return (
      <div
        className="cursor-pointer transition-all duration-200 hover:scale-125"
        style={{
          width: `${markerScale.size}px`,
          height: `${markerScale.size}px`,
          borderRadius: '50%',
          backgroundColor: color,
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
        title={`${store.name} - ${mainCategory}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    );
  }

  // 🎬 SMOOTH PIN scaling (zoom 13-16+) - Redesigned for maximum icon visibility
  const pinSize = markerScale.size;
  // Much larger icon for better visibility
  const iconSize = Math.max(14, Math.round(pinSize * 0.5));
  // Position icon in the upper circle area
  const iconTop = Math.round(pinSize * 0.12);

  return (
    <div
      className="cursor-pointer transform hover:scale-110 transition-all duration-200 hover:z-50 relative"
      style={{
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
      }}
      title={`${store.name} - ${mainCategory}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Redesigned pin with larger icon circle */}
      <svg
        width={pinSize}
        height={pinSize}
        viewBox="0 0 24 24"
        className="transition-all duration-200"
      >
        {/* Outer stroke for contrast */}
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
        />
        {/* White circle background for icon - larger and more prominent */}
        <circle
          cx="12"
          cy="8.5"
          r="4.5"
          fill="white"
        />
        {/* Color ring around white circle for depth */}
        <circle
          cx="12"
          cy="8.5"
          r="4.5"
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          opacity="0.5"
        />
      </svg>

      {/* Icon overlay - much larger and more visible on white background */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none"
        style={{
          top: `${iconTop}px`,
        }}
      >
        <IconComponent size={iconSize} color={color} strokeWidth={2.5} />
      </div>
    </div>
  );
});

IconStoreMarker.displayName = 'IconStoreMarker';
