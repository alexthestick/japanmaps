/**
 * RadarHUD
 *
 * Ambient status strip shown when Radar mode is active.
 * Sits at the top of the map container (below the main nav header).
 *
 * Two-row layout (72px total):
 *
 *   Row 1 (42px) — primary context
 *     Left:  ● GPS dot · RADAR · [neighborhood] [N★]
 *     Right: nearest store name + distance (when store is in range)
 *
 *   Row 2 (30px) — session progress
 *     Left:  ★ N stamps  (or "— no stamps yet —")
 *     Right: X.Xkm walked (shown once GPS is locked and distance > 10m)
 *
 * Design rules:
 *   - Neighborhood is ALWAYS visible in row 1 — never displaced by store proximity.
 *   - "N ★ here" stamp count shows when ≥1 stamp in current neighborhood this session.
 *   - Nearest store lives in row 1 right — visible simultaneously with neighborhood.
 *   - Distance in row 2 right — visible simultaneously with stamp count.
 *   - No animations on large blur elements (GPU repaint rule from CLAUDE.md).
 */

import { motion } from 'framer-motion';

// ── HUD height constant — NeighborhoodEntryCard uses this for top positioning ─
export const RADAR_HUD_HEIGHT = 72;

interface RadarHUDProps {
  /** Whether GPS lock is confirmed (exploreUserPosition != null) */
  hasGps: boolean;
  /** Total stamps this session */
  stampCount: number;
  /** Live walking distance this session in metres */
  distanceM: number;
  /** Detected neighborhood (nearest known coord within 1.5km), or null */
  neighborhood: string | null;
  /** How many stores the user has stamped in the current neighborhood this session */
  neighborhoodStampCount: number;
  /** Nearest unstamped store within 150m, or null */
  nearestStore: { name: string; distanceM: number } | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RadarHUD({
  hasGps,
  stampCount,
  distanceM,
  neighborhood,
  neighborhoodStampCount,
  nearestStore,
}: RadarHUDProps) {
  const showDistance = hasGps && distanceM >= 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="absolute left-0 right-0 z-[50] flex flex-col"
      style={{
        top: 0,
        height: RADAR_HUD_HEIGHT,
        backgroundColor: 'rgba(6, 8, 14, 0.96)',
        borderBottom: '1px solid rgba(34, 217, 238, 0.18)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* ── Row 1: GPS context + nearest store ──────────────────────────────── */}
      <div className="flex items-center px-4" style={{ height: 42 }}>

        {/* Left zone: breathing dot · RADAR · neighborhood · stamp count here */}
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">

          {/* Breathing dot */}
          <div style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: hasGps ? '#22D9EE' : 'rgba(34,217,238,0.3)',
                boxShadow: hasGps ? '0 0 6px rgba(34,217,238,0.8)' : 'none',
                animation: hasGps ? 'radar-dot-breathe 3s ease-in-out infinite' : undefined,
              }}
            />
          </div>

          {/* RADAR / Locating label */}
          <span
            className="text-[10px] font-black tracking-[0.2em] uppercase flex-shrink-0"
            style={{ color: hasGps ? '#22D9EE' : 'rgba(34,217,238,0.45)' }}
          >
            {hasGps ? 'Radar' : 'Locating…'}
          </span>

          {/* Neighborhood — always visible when detected */}
          {neighborhood && (
            <>
              <span
                className="text-[10px] flex-shrink-0"
                style={{ color: 'rgba(34,217,238,0.3)' }}
              >
                ·
              </span>
              <span
                className="text-[11px] font-semibold truncate"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                {neighborhood}
              </span>

              {/* Neighborhood stamp count — shows once ≥1 stamp here this session */}
              {neighborhoodStampCount > 0 && (
                <motion.span
                  key={neighborhoodStampCount}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="text-[9px] font-black flex-shrink-0 tabular-nums"
                  style={{ color: 'rgba(34,217,238,0.55)' }}
                >
                  {neighborhoodStampCount}★
                </motion.span>
              )}
            </>
          )}
        </div>

        {/* Right zone: nearest store name + distance */}
        {nearestStore && (
          <div className="flex flex-col items-end flex-shrink-0 max-w-[44%]">
            <span
              className="text-[11px] font-bold text-white leading-tight truncate max-w-full"
            >
              {nearestStore.name}
            </span>
            <span
              className="text-[10px]"
              style={{ color: 'rgba(34,217,238,0.6)' }}
            >
              {formatDistance(nearestStore.distanceM)} away
            </span>
          </div>
        )}
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div
        className="mx-4"
        style={{ height: 1, backgroundColor: 'rgba(34,217,238,0.07)', flexShrink: 0 }}
      />

      {/* ── Row 2: Stamp count + distance walked ────────────────────────────── */}
      <div className="flex items-center justify-between px-4" style={{ height: 30 }}>

        {/* Left: stamp count */}
        <div className="flex items-center gap-1.5">
          {stampCount > 0 ? (
            <>
              <motion.span
                key={stampCount}
                initial={{ scale: 1.35, color: '#22D9EE' }}
                animate={{ scale: 1,    color: '#ffffff' }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
                className="text-[13px] font-black tabular-nums leading-none"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {stampCount}
              </motion.span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: 'rgba(34,217,238,0.55)' }}
              >
                {stampCount === 1 ? 'stamp' : 'stamps'}
              </span>
            </>
          ) : (
            <span
              className="text-[10px]"
              style={{ color: 'rgba(255,255,255,0.18)' }}
            >
              — no stamps yet —
            </span>
          )}
        </div>

        {/* Right: distance walked */}
        {showDistance && (
          <span
            className="text-[10px] font-medium tabular-nums"
            style={{ color: 'rgba(255,255,255,0.32)' }}
          >
            {formatDistance(distanceM)} walked
          </span>
        )}
      </div>
    </motion.div>
  );
}
