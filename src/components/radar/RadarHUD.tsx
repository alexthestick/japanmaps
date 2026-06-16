/**
 * RadarHUD
 *
 * Thin ambient status strip that replaces the search bar + filter pills
 * when Radar mode is active. Sits just below the main nav header.
 *
 * Three zones:
 *   Left  — breathing dot + "RADAR" label (GPS active indicator)
 *   Center — session stamp counter (live, ticks up on each stamp)
 *   Right  — nearest unstamped store + distance, or neighborhood name
 *
 * Intentionally minimal — glanceable at arm's length while walking.
 * All data is passed as props (no internal fetching).
 */

import { motion } from 'framer-motion';

interface RadarHUDProps {
  /** Whether GPS lock is confirmed (exploreUserPosition != null) */
  hasGps: boolean;
  /** Live stamp count for this session */
  stampCount: number;
  /** Nearest unstamped store, or null if none within 150m */
  nearestStore: { name: string; distanceM: number } | null;
  /** Detected neighborhood (nearest known coord within 1.5km) */
  neighborhood: string | null;
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

export function RadarHUD({ hasGps, stampCount, nearestStore, neighborhood }: RadarHUDProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="absolute left-0 right-0 z-[50] flex items-center px-4"
      style={{
        top: 0,
        height: 52,
        backgroundColor: 'rgba(6, 8, 14, 0.96)',
        borderBottom: '1px solid rgba(34, 217, 238, 0.18)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* ── Left: GPS status dot + RADAR label ─────────────────────────── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Breathing dot — pulses slowly when GPS is locked */}
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
        <span
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ color: hasGps ? '#22D9EE' : 'rgba(34,217,238,0.45)' }}
        >
          {hasGps ? 'Radar' : 'Locating…'}
        </span>
      </div>

      {/* ── Center: Stamp counter ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center gap-1.5">
        {stampCount > 0 ? (
          <>
            <motion.span
              key={stampCount}
              initial={{ scale: 1.35, color: '#22D9EE' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-lg font-black tabular-nums leading-none"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {stampCount}
            </motion.span>
            <span className="text-[11px] font-semibold" style={{ color: 'rgba(34,217,238,0.6)' }}>
              {stampCount === 1 ? 'stamp' : 'stamps'}
            </span>
          </>
        ) : (
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            — no stamps yet —
          </span>
        )}
      </div>

      {/* ── Right: Nearest store or neighborhood ────────────────────────── */}
      <div className="flex flex-col items-end flex-shrink-0 min-w-0 max-w-[44%]">
        {nearestStore ? (
          <>
            <span
              className="text-[11px] font-bold text-white leading-tight truncate max-w-full"
            >
              {nearestStore.name}
            </span>
            <span className="text-[10px]" style={{ color: 'rgba(34,217,238,0.6)' }}>
              {formatDistance(nearestStore.distanceM)} away
            </span>
          </>
        ) : neighborhood ? (
          <span className="text-[11px] font-semibold truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {neighborhood}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
