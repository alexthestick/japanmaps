/**
 * RadarStoreMarker
 *
 * Pokéstop-style circular disc marker used in Radar mode instead of the
 * normal teardrop pins. Renders as a Mapbox <Marker> child.
 *
 * Four visual states based on distance and stamp history:
 *
 *  stamped    — green disc, faded, ✓ overlay. "You've been here."
 *  far        — small grey disc (> 150m). Present but dormant.
 *  approaching— medium disc with category color (50–150m). Waking up.
 *  in_range   — large bright disc with pulsing ring (< checkinRadius).
 *               Coin-flip animation fires once on entering this state.
 *
 * The coin flip is a brief 360° Y-axis rotation on the transition from
 * approaching → in_range. It's the Pokéstop "ping" equivalent — signals
 * that the store is now stampable without any text.
 */

import { memo, useEffect, useRef, useState } from 'react';
import {
  Shirt, UtensilsCrossed, Coffee, Home, Building2, MapPin, type LucideIcon,
} from 'lucide-react';
import { MAIN_CATEGORY_COLORS } from '../../lib/constants';
import type { Store } from '../../types/store';

// ─── Category icon map ────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Fashion:      Shirt,
  Food:         UtensilsCrossed,
  Coffee:       Coffee,
  'Home Goods': Home,
  Museum:       Building2,
  Spots:        MapPin,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface RadarStoreMarkerProps {
  store: Store;
  distance: number;       // metres from user position
  checkinRadius: number;  // dynamic in-range threshold
  isStamped: boolean;     // user has already checked in here
  onClick: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const RadarStoreMarker = memo(function RadarStoreMarker({
  store,
  distance,
  checkinRadius,
  isStamped,
  onClick,
}: RadarStoreMarkerProps) {
  const categoryColor = MAIN_CATEGORY_COLORS[store.mainCategory ?? 'Fashion'] ?? '#22D9EE';
  const Icon = CATEGORY_ICONS[store.mainCategory ?? 'Fashion'] ?? Shirt;

  // Determine state
  const isInRange    = !isStamped && distance <= checkinRadius;
  const isApproaching = !isStamped && !isInRange && distance <= 150;
  // "far" = within 300m storesForMap bubble but > 150m

  // ── Coin-flip animation ──────────────────────────────────────────────────
  // Fires once when transitioning approaching → in_range. Uses a CSS animation
  // class toggled via a key increment rather than Framer Motion (simpler, no
  // extra dependency inside a memoised marker that renders for many stores).
  const [flipKey, setFlipKey] = useState(0);
  const prevInRange = useRef(false);

  useEffect(() => {
    if (isInRange && !prevInRange.current) {
      setFlipKey(k => k + 1);
    }
    prevInRange.current = isInRange;
  }, [isInRange]);

  // ── Visual parameters by state ───────────────────────────────────────────
  //
  // Three clearly distinct visual states using fill density as the language:
  //
  //   far        — grey outline only, transparent fill. "Possible, not yet relevant."
  //   approaching— category color outline + subtle fill (15%). "Getting warmer."
  //   in_range   — solid filled disc, white icon, glow ring. "You're here. Stamp it."
  //   stamped    — faded green solid, ✓ icon. "Already been."

  type DiscState = 'far' | 'approaching' | 'in_range' | 'stamped';
  const state: DiscState = isStamped ? 'stamped'
    : isInRange    ? 'in_range'
    : isApproaching ? 'approaching'
    : 'far';

  const cfg = {
    far: {
      size: 26, iconSize: 10,
      bg: 'transparent',
      border: `1.5px solid #6b728066`,
      iconColor: '#6b7280',
      opacity: 0.7,
      shadow: 'none',
      showRing: false,
    },
    approaching: {
      size: 34, iconSize: 14,
      bg: `${categoryColor}18`,
      border: `2px solid ${categoryColor}`,
      iconColor: categoryColor,
      opacity: 1,
      shadow: `0 2px 8px rgba(0,0,0,0.35)`,
      showRing: false,
    },
    in_range: {
      size: 44, iconSize: 19,
      bg: categoryColor,
      border: `2.5px solid white`,
      iconColor: 'white',
      opacity: 1,
      shadow: `0 0 20px ${categoryColor}80, 0 4px 12px rgba(0,0,0,0.5)`,
      showRing: true,
    },
    stamped: {
      size: 30, iconSize: 12,
      bg: 'rgba(16,185,129,0.25)',
      border: `2px solid #10b981`,
      iconColor: '#10b981',
      opacity: 0.55,
      shadow: 'none',
      showRing: false,
    },
  }[state];

  return (
    <div
      onClick={onClick}
      style={{
        width:  cfg.size,
        height: cfg.size,
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {/* Pulsing ring — in-range only */}
      {cfg.showRing && (
        <div
          style={{
            position: 'absolute',
            inset: -7,
            borderRadius: '50%',
            border: `2px solid ${categoryColor}90`,
            animation: 'ring-pulse 2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Main disc */}
      <div
        key={flipKey}
        style={{
          width:           cfg.size,
          height:          cfg.size,
          borderRadius:    '50%',
          backgroundColor: cfg.bg,
          border:          cfg.border,
          opacity:         cfg.opacity,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          boxShadow:       cfg.shadow,
          animation:       flipKey > 0 ? 'radar-disc-flip 0.42s ease-out' : undefined,
          transition:      'width 0.25s ease, height 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease',
        }}
      >
        {state === 'stamped' ? (
          <span style={{ color: '#10b981', fontSize: cfg.iconSize + 2, lineHeight: 1, fontWeight: 700 }}>✓</span>
        ) : (
          <Icon size={cfg.iconSize} color={cfg.iconColor} strokeWidth={state === 'in_range' ? 2.5 : 2} />
        )}
      </div>
    </div>
  );
});
