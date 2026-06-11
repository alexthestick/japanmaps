/**
 * RadarSessionSummary
 *
 * Brief overlay shown when the user exits Radar mode after stamping ≥1 store.
 * Auto-dismisses after 4s, or tap anywhere to close early.
 *
 * Props:
 *   stamps      — number of stores stamped this session
 *   distanceKm  — total walking distance in km (Haversine sum of GPS fixes)
 *   neighborhood — closest neighborhood at exit time (or city as fallback)
 *   onDismiss   — called on auto-dismiss or tap
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface RadarSessionSummaryProps {
  stamps: number;
  distanceKm: number;
  neighborhood: string | null;
  onDismiss: () => void;
}

export function RadarSessionSummary({
  stamps,
  distanceKm,
  neighborhood,
  onDismiss,
}: RadarSessionSummaryProps) {
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const distanceStr = distanceKm < 0.1
    ? `${Math.round(distanceKm * 1000)}m`
    : `${distanceKm.toFixed(1)}km`;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      onClick={onDismiss}
      className="absolute left-4 right-4 z-[36] cursor-pointer"
      style={{ bottom: 'calc(9.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div
        className="w-full rounded-2xl px-5 py-4 backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(10, 14, 12, 0.96)',
          border: '1.5px solid rgba(16,185,129,0.45)',
          boxShadow: '0 0 32px rgba(16,185,129,0.15), 0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* Label */}
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: 'rgba(16,185,129,0.6)' }}
        >
          Today's walk
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-0 divide-x"
          style={{ '--tw-divide-opacity': 1, borderColor: 'rgba(16,185,129,0.15)' } as React.CSSProperties}
        >
          {/* Stamps */}
          <div className="flex flex-col items-center pr-5">
            <span className="text-2xl font-black text-white tabular-nums">{stamps}</span>
            <span className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: 'rgba(16,185,129,0.6)' }}>
              {stamps === 1 ? 'Stamp' : 'Stamps'}
            </span>
          </div>

          {/* Distance */}
          <div className="flex flex-col items-center px-5">
            <span className="text-2xl font-black text-white tabular-nums">{distanceStr}</span>
            <span className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: 'rgba(16,185,129,0.6)' }}>
              Walked
            </span>
          </div>

          {/* Neighborhood */}
          {neighborhood && (
            <div className="flex flex-col items-start pl-5 flex-1 min-w-0">
              <span
                className="text-sm font-bold text-white leading-tight truncate w-full"
              >
                {neighborhood}
              </span>
              <span className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: 'rgba(16,185,129,0.6)' }}>
                Area
              </span>
            </div>
          )}
        </div>

        {/* Dismiss hint */}
        <p className="text-center text-[10px] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Tap to dismiss
        </p>
      </div>
    </motion.div>
  );
}
