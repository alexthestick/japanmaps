import React from 'react';
import { IconStoreMarker } from './IconStoreMarker';
import type { Store } from '../../types/store';

interface SpotlightMarkerProps {
  store: Store;
  activeFilter?: string | null;
  activeMainCategory?: string | null;
  onHoverChange?: (storeId: string | null) => void;
  currentZoom: number;
  spotlightOrder: number; // 1-5, which position in the spotlight
}

/**
 * PHASE 3: Spotlight Marker - Glowing ring with numbered badge
 * Wraps IconStoreMarker with visual spotlight treatment
 */
export const SpotlightMarker = React.memo(({
  store,
  activeFilter,
  activeMainCategory,
  onHoverChange,
  currentZoom,
  spotlightOrder,
}: SpotlightMarkerProps) => {
  return (
    <div className="relative">
      {/* Pulsing glow ring - cyan cyberpunk style */}
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          width: '64px',
          height: '64px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(34, 217, 238, 0.4) 0%, rgba(34, 217, 238, 0.2) 50%, transparent 70%)',
          boxShadow: `
            0 0 20px 5px rgba(34, 217, 238, 0.6),
            0 0 40px 10px rgba(34, 217, 238, 0.4),
            0 0 60px 15px rgba(34, 217, 238, 0.2)
          `,
          border: '2px solid rgba(34, 217, 238, 0.6)',
          pointerEvents: 'none',
          zIndex: -1,
          animationDuration: '2s',
        }}
      />

      {/* Secondary subtle ring for depth */}
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          width: '56px',
          height: '56px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          pointerEvents: 'none',
          zIndex: -1,
          animationDuration: '2s',
          animationDelay: '0.5s',
        }}
      />

      {/* The actual store marker */}
      <div className="relative z-10">
        <IconStoreMarker
          store={store}
          activeFilter={activeFilter}
          activeMainCategory={activeMainCategory}
          onHoverChange={onHoverChange}
          currentZoom={currentZoom}
        />
      </div>

      {/* Numbered badge - top-right corner */}
      <div
        className="absolute -top-1 -right-1 z-20"
        style={{
          width: '20px',
          height: '20px',
          background: 'linear-gradient(135deg, #22D9EE 0%, #3B82F6 100%)',
          borderRadius: '50%',
          border: '2px solid white',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), 0 0 12px rgba(34, 217, 238, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          className="text-white font-black text-xs"
          style={{
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            fontSize: '11px',
            lineHeight: 1,
          }}
        >
          {spotlightOrder}
        </span>
      </div>
    </div>
  );
});

SpotlightMarker.displayName = 'SpotlightMarker';
