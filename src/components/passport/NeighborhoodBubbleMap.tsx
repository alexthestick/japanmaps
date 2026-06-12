/**
 * NeighborhoodBubbleMap
 *
 * SVG bubble map showing every neighborhood in the user's stamped cities.
 * Each neighborhood is a circle plotted at its real geographic position.
 *
 * Visual states:
 *   ghost    — no stamps yet. Faint outline. Present but dark.
 *   visited  — 1–2 stamps. Dim cyan tint. You've started.
 *   bronze   — 3+ stamps.  Amber ring + glow.
 *   silver   — 7+ stamps.  Bright white-blue ring + stronger glow.
 *   gold     — 15+ stamps. Full cyan + purple halo. The goal.
 *
 * Tapping a circle opens an inline tooltip below the map with name,
 * stamp count, and progress to next tier.
 *
 * Performance: pure SVG, no external libraries. SVG glow filters are
 * compositor-friendly (no layout recalc). No continuous animations.
 * All transitions are CSS `transition` (not Framer Motion repeat loops).
 */

import { useState, useMemo } from 'react';
import { NEIGHBORHOOD_COORDINATES } from '../../lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NeighborhoodCount {
  neighborhood: string;
  city: string;
  store_count: number;
}

export interface BadgeProgressEntry {
  neighborhood: string;
  city: string;
  visited_count: number;
  total_store_count: number;
}

interface NeighborhoodBubbleMapProps {
  badgeProgress: BadgeProgressEntry[];
  allCounts: NeighborhoodCount[];
}

// ─── Tier logic ───────────────────────────────────────────────────────────────

type Tier = 'ghost' | 'visited' | 'bronze' | 'silver' | 'gold';

function getTier(visited: number): Tier {
  if (visited === 0) return 'ghost';
  if (visited < 3)  return 'visited';
  if (visited < 7)  return 'bronze';
  if (visited < 15) return 'silver';
  return 'gold';
}

function nextTierInfo(visited: number): { label: string; need: number } | null {
  if (visited < 3)  return { label: 'Bronze', need: 3  - visited };
  if (visited < 7)  return { label: 'Silver', need: 7  - visited };
  if (visited < 15) return { label: 'Gold',   need: 15 - visited };
  return null;
}

// ─── SVG tier colours ─────────────────────────────────────────────────────────

const TIER_STYLE: Record<Tier, {
  fill:         string;
  stroke:       string;
  strokeWidth:  number;
  filterId:     string | null;
  labelColor:   string;
}> = {
  ghost: {
    fill:        'rgba(255,255,255,0.03)',
    stroke:      'rgba(255,255,255,0.12)',
    strokeWidth: 1,
    filterId:    null,
    labelColor:  'rgba(255,255,255,0.2)',
  },
  visited: {
    fill:        'rgba(34,217,238,0.08)',
    stroke:      'rgba(34,217,238,0.35)',
    strokeWidth: 1.5,
    filterId:    'glow-visited',
    labelColor:  'rgba(34,217,238,0.5)',
  },
  bronze: {
    fill:        'rgba(245,158,11,0.12)',
    stroke:      'rgba(245,158,11,0.7)',
    strokeWidth: 1.5,
    filterId:    'glow-bronze',
    labelColor:  'rgba(245,158,11,0.8)',
  },
  silver: {
    fill:        'rgba(203,213,225,0.14)',
    stroke:      'rgba(203,213,225,0.85)',
    strokeWidth: 2,
    filterId:    'glow-silver',
    labelColor:  'rgba(203,213,225,0.9)',
  },
  gold: {
    fill:        'rgba(34,217,238,0.18)',
    stroke:      'rgba(34,217,238,1)',
    strokeWidth: 2,
    filterId:    'glow-gold',
    labelColor:  '#22d9ee',
  },
};

// ─── Projection helpers ───────────────────────────────────────────────────────

interface Bounds {
  minLat: number; maxLat: number;
  minLng: number; maxLng: number;
}

function projectPoint(
  lat: number, lng: number,
  bounds: Bounds,
  svgW: number, svgH: number,
  pad: number,
): { x: number; y: number } {
  const usableW = svgW - pad * 2;
  const usableH = svgH - pad * 2;
  const x = pad + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * usableW;
  // Latitude increases northward but SVG y increases downward — invert.
  const y = pad + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * usableH;
  return { x, y };
}

function calcBounds(coords: Array<{ latitude: number; longitude: number }>): Bounds {
  const lats = coords.map(c => c.latitude);
  const lngs = coords.map(c => c.longitude);
  const margin = 0.015; // ~1.5km padding around the outermost points
  return {
    minLat: Math.min(...lats) - margin,
    maxLat: Math.max(...lats) + margin,
    minLng: Math.min(...lngs) - margin,
    maxLng: Math.max(...lngs) + margin,
  };
}

// ─── SVG defs (glow filters + grid pattern) ───────────────────────────────────

function SvgDefs() {
  return (
    <defs>
      {/* Grid dot pattern */}
      <pattern id="grid-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="0.5" cy="0.5" r="0.5" fill="rgba(255,255,255,0.06)" />
      </pattern>

      {/* Glow filters — blur spreads at different radii per tier */}
      {[
        { id: 'glow-visited', color: '34,217,238', blur: '2.5', opacity: '0.5' },
        { id: 'glow-bronze',  color: '245,158,11', blur: '3',   opacity: '0.6' },
        { id: 'glow-silver',  color: '203,213,225', blur: '4',  opacity: '0.6' },
        { id: 'glow-gold',    color: '34,217,238',  blur: '6',  opacity: '0.8' },
      ].map(({ id, color, blur, opacity }) => (
        <filter key={id} id={id} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix
            in="blur" type="matrix"
            values={`0 0 0 0 ${parseInt(color.split(',')[0])/255}
                     0 0 0 0 ${parseInt(color.split(',')[1])/255}
                     0 0 0 0 ${parseInt(color.split(',')[2])/255}
                     0 0 0 ${opacity} 0`}
            result="coloredBlur"
          />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      ))}

      {/* Extra outer halo for gold tier */}
      <filter id="glow-gold-halo" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="outerBlur" />
        <feColorMatrix
          in="outerBlur" type="matrix"
          values="0.66 0 0 0 0
                  0 0 0 0 0
                  0.93 0 0 0 0
                  0 0 0 0.35 0"
          result="purpleHalo"
        />
        <feMerge>
          <feMergeNode in="purpleHalo" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

// ─── Single city map ──────────────────────────────────────────────────────────

interface CityMapProps {
  cityName: string;
  nodes: Array<{
    name: string;
    lat: number;
    lng: number;
    storeCount: number;
    visitedCount: number;
    totalStoreCount: number;
  }>;
  selectedName: string | null;
  onSelect: (name: string | null) => void;
}

const SVG_W = 360;
const SVG_H = 260;
const PAD   = 28;

// Scale radius: 6px for small neighborhoods, up to 16px for dense ones.
function calcRadius(storeCount: number, maxCount: number): number {
  const MIN_R = 6;
  const MAX_R = 16;
  if (maxCount <= 0) return MIN_R;
  return MIN_R + ((storeCount / maxCount) ** 0.55) * (MAX_R - MIN_R);
}

function CityMap({ cityName, nodes, selectedName, onSelect }: CityMapProps) {
  const bounds = useMemo(() => calcBounds(nodes.map(n => ({ latitude: n.lat, longitude: n.lng }))), [nodes]);
  const maxCount = Math.max(...nodes.map(n => n.storeCount), 1);

  const projected = useMemo(() =>
    nodes.map(n => ({
      ...n,
      ...projectPoint(n.lat, n.lng, bounds, SVG_W, SVG_H, PAD),
      r: calcRadius(n.storeCount, maxCount),
      tier: getTier(n.visitedCount),
    })),
  [nodes, bounds, maxCount]);

  const selected = projected.find(n => n.name === selectedName) ?? null;

  return (
    <div>
      {/* City label */}
      <p
        className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1"
        style={{ color: 'rgba(255,255,255,0.25)' }}
      >
        {cityName}
      </p>

      {/* SVG map */}
      <div
        className="rounded-xl overflow-hidden relative"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ display: 'block', backgroundColor: '#080810' }}
        >
          <SvgDefs />

          {/* Background grid dots */}
          <rect width={SVG_W} height={SVG_H} fill="url(#grid-dots)" />

          {/* Corner marks — retro-futuristic decoration */}
          {[[PAD-10, PAD-10], [SVG_W-PAD+10, PAD-10], [PAD-10, SVG_H-PAD+10], [SVG_W-PAD+10, SVG_H-PAD+10]].map(([cx, cy], i) => (
            <g key={i} transform={`translate(${cx},${cy})`}>
              <line
                x1={i % 2 === 0 ? 0 : -8} y1={i < 2 ? 0 : -8}
                x2={i % 2 === 0 ? 8 : 0}  y2={i < 2 ? 8 : 0}
                stroke="rgba(34,217,238,0.2)" strokeWidth="1"
              />
              <line
                x1={i % 2 === 0 ? 0 : -8} y1={i < 2 ? 8 : 0}
                x2={i % 2 === 0 ? 0 : 0}  y2={i < 2 ? 0 : -8}
                stroke="rgba(34,217,238,0.2)" strokeWidth="1"
              />
            </g>
          ))}

          {/* Ghost layer first (below active nodes) */}
          {projected.filter(n => n.tier === 'ghost').map(n => (
            <g key={n.name} onClick={() => onSelect(n.name === selectedName ? null : n.name)} style={{ cursor: 'pointer' }}>
              <circle cx={n.x} cy={n.y} r={n.r + 6} fill="transparent" /> {/* tap target */}
              <circle
                cx={n.x} cy={n.y} r={n.r}
                fill={TIER_STYLE.ghost.fill}
                stroke={TIER_STYLE.ghost.stroke}
                strokeWidth={TIER_STYLE.ghost.strokeWidth}
                style={{ transition: 'opacity 0.2s' }}
              />
            </g>
          ))}

          {/* Active nodes (visited, bronze, silver, gold) */}
          {projected.filter(n => n.tier !== 'ghost').map(n => {
            const style = TIER_STYLE[n.tier];
            const isGold = n.tier === 'gold';
            const isSelected = n.name === selectedName;

            return (
              <g
                key={n.name}
                onClick={() => onSelect(n.name === selectedName ? null : n.name)}
                style={{ cursor: 'pointer' }}
              >
                {/* Wide invisible tap target */}
                <circle cx={n.x} cy={n.y} r={n.r + 8} fill="transparent" />

                {/* Gold outer halo (separate layer so it doesn't affect inner circle) */}
                {isGold && (
                  <circle
                    cx={n.x} cy={n.y} r={n.r + 4}
                    fill="rgba(168,85,247,0.08)"
                    filter="url(#glow-gold-halo)"
                  />
                )}

                {/* Main circle */}
                <circle
                  cx={n.x} cy={n.y} r={n.r}
                  fill={style.fill}
                  stroke={isSelected ? '#ffffff' : style.stroke}
                  strokeWidth={isSelected ? 2 : style.strokeWidth}
                  filter={style.filterId ? `url(#${style.filterId})` : undefined}
                  style={{ transition: 'stroke 0.15s, stroke-width 0.15s' }}
                />

                {/* Fill progress arc for partial completion */}
                {n.tier !== 'ghost' && n.totalStoreCount > 0 && (
                  <circle
                    cx={n.x} cy={n.y}
                    r={n.r - 3}
                    fill={style.stroke}
                    opacity={Math.min(0.4, (n.visitedCount / n.totalStoreCount) * 0.45)}
                  />
                )}
              </g>
            );
          })}

          {/* Labels for non-ghost neighborhoods */}
          {projected.filter(n => n.tier !== 'ghost').map(n => (
            <text
              key={`lbl-${n.name}`}
              x={n.x}
              y={n.y + n.r + 9}
              textAnchor="middle"
              fontSize="7"
              fill={TIER_STYLE[n.tier].labelColor}
              style={{ pointerEvents: 'none', fontFamily: 'system-ui', fontWeight: 600 }}
            >
              {n.name.length > 12 ? n.name.slice(0, 11) + '…' : n.name}
            </text>
          ))}
        </svg>
      </div>

      {/* Tooltip for selected neighborhood */}
      {selected && (
        <div
          className="mt-2 mx-1 rounded-xl px-4 py-3"
          style={{
            backgroundColor: 'rgba(8,8,16,0.97)',
            border: `1px solid ${TIER_STYLE[selected.tier].stroke}`,
            boxShadow: `0 0 16px ${TIER_STYLE[selected.tier].stroke}30`,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">{selected.name}</p>
              <p className="text-xs mt-0.5" style={{ color: TIER_STYLE[selected.tier].labelColor }}>
                {selected.visitedCount > 0
                  ? `${selected.visitedCount} of ${selected.totalStoreCount || selected.storeCount} stores stamped`
                  : `${selected.storeCount} stores to discover`
                }
              </p>
              {(() => {
                const next = nextTierInfo(selected.visitedCount);
                if (!next) return (
                  <p className="text-xs mt-1 font-semibold" style={{ color: '#22d9ee' }}>
                    Gold — fully explored ✦
                  </p>
                );
                if (selected.visitedCount === 0) return null;
                return (
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {next.need} more to {next.label}
                  </p>
                );
              })()}
            </div>

            {/* Tier badge */}
            <div
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-xs font-black"
              style={{
                backgroundColor: `${TIER_STYLE[selected.tier].stroke}18`,
                border: `1.5px solid ${TIER_STYLE[selected.tier].stroke}`,
                color: TIER_STYLE[selected.tier].labelColor,
              }}
            >
              {selected.tier === 'gold'   ? '✦' :
               selected.tier === 'silver' ? '◉' :
               selected.tier === 'bronze' ? '◎' :
               selected.tier === 'visited'? '●' : '○'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function MapLegend() {
  const items: Array<{ symbol: string; label: string; color: string }> = [
    { symbol: '○', label: 'Unexplored', color: 'rgba(255,255,255,0.2)' },
    { symbol: '◎', label: 'Bronze 3+',  color: 'rgba(245,158,11,0.8)' },
    { symbol: '◉', label: 'Silver 7+',  color: 'rgba(203,213,225,0.9)' },
    { symbol: '✦', label: 'Gold 15+',   color: '#22d9ee'               },
  ];
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-1">
          <span style={{ color: item.color, fontSize: 10 }}>{item.symbol}</span>
          <span className="text-[9px] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function NeighborhoodBubbleMap({ badgeProgress, allCounts }: NeighborhoodBubbleMapProps) {
  const [selectedName, setSelectedName] = useState<string | null>(null);

  // Build a lookup: neighborhoodName → BadgeProgressEntry
  const progressMap = useMemo(() => {
    const m = new Map<string, BadgeProgressEntry>();
    for (const bp of badgeProgress) m.set(bp.neighborhood, bp);
    return m;
  }, [badgeProgress]);

  // Determine which cities have enough data to show
  const citiesWithStamps = useMemo(() =>
    [...new Set(badgeProgress.map(bp => bp.city))],
  [badgeProgress]);

  if (citiesWithStamps.length === 0) return null;

  // For each city, build the full node list (stamped + ghost)
  const cityMaps = useMemo(() => {
    return citiesWithStamps.map(city => {
      // All neighborhoods in this city from the counts RPC
      const cityAllCounts = allCounts.filter(c => c.city === city);

      // All neighborhood names to show: union of allCounts + coordinates
      const nameSet = new Set([
        ...cityAllCounts.map(c => c.neighborhood),
        ...badgeProgress.filter(bp => bp.city === city).map(bp => bp.neighborhood),
      ]);

      const nodes = [...nameSet]
        .filter(name => NEIGHBORHOOD_COORDINATES[name]) // must have coordinates
        .map(name => {
          const coords = NEIGHBORHOOD_COORDINATES[name];
          const count  = cityAllCounts.find(c => c.neighborhood === name);
          const prog   = progressMap.get(name);
          return {
            name,
            lat:              coords.latitude,
            lng:              coords.longitude,
            storeCount:       count?.store_count ?? 1,
            visitedCount:     prog?.visited_count ?? 0,
            totalStoreCount:  prog?.total_store_count ?? count?.store_count ?? 0,
          };
        });

      return { city, nodes };
    });
  }, [citiesWithStamps, allCounts, badgeProgress, progressMap]);

  const handleSelect = (name: string | null) => {
    setSelectedName(prev => prev === name ? null : name);
  };

  return (
    <div className="space-y-6">
      {cityMaps.map(({ city, nodes }) => (
        <CityMap
          key={city}
          cityName={city}
          nodes={nodes}
          selectedName={selectedName}
          onSelect={handleSelect}
        />
      ))}
      <MapLegend />
    </div>
  );
}
