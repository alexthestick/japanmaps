/**
 * NeighborhoodEntryCard
 *
 * RPG-style "entering neighborhood" notification that slides down from below
 * the RadarHUD when the user crosses into a new neighborhood.
 *
 * Two states:
 *   ENTERING  — first time in this neighborhood this session (cyan/teal)
 *   RETURNING — user has already stamped a store here this session (amber)
 *
 * Auto-dismisses after 2.5 seconds. Also dismissible by tap.
 * Positioned absolute at top-[76px] (4px gap below 72px HUD) with z-[45].
 *
 * The "N stores here" count gives the user an immediate quest prompt —
 * the foundation for the neighborhood-completion system.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface NeighborhoodEntryCardProps {
  /** Neighborhood name to display */
  neighborhood: string;
  /** True if the user has already stamped a store here this session */
  isReturning: boolean;
  /** Total stores in this neighborhood (from filteredStores) */
  storeCount: number;
  /** Called when card should be dismissed */
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 2500;

export function NeighborhoodEntryCard({
  neighborhood,
  isReturning,
  storeCount,
  onDismiss,
}: NeighborhoodEntryCardProps) {
  // Auto-dismiss after delay
  useEffect(() => {
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [onDismiss]);

  // Color scheme: cyan for ENTERING, amber for RETURNING
  const accent     = isReturning ? '#fbbf24' : '#22D9EE';
  const accentDim  = isReturning ? 'rgba(251,191,36,0.15)' : 'rgba(34,217,238,0.12)';
  const accentBorder = isReturning ? 'rgba(251,191,36,0.28)' : 'rgba(34,217,238,0.25)';
  const accentGlow = isReturning ? 'rgba(251,191,36,0.08)' : 'rgba(34,217,238,0.07)';

  const label  = isReturning ? 'BACK IN'   : 'ENTERING';
  const icon   = isReturning ? '↩'          : '▶';

  return (
    <motion.button
      // Slide down from the HUD edge, spring eased
      initial={{ y: -16, opacity: 0, scale: 0.96 }}
      animate={{ y: 0,   opacity: 1, scale: 1 }}
      exit={{   y: -12,  opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', damping: 26, stiffness: 300 }}
      onClick={onDismiss}
      className="absolute left-4 right-4 z-[45] rounded-2xl text-left overflow-hidden"
      style={{
        top: 76, // 72px HUD + 4px gap
        backgroundColor: 'rgba(6, 8, 14, 0.93)',
        border: `1px solid ${accentBorder}`,
        backdropFilter: 'blur(16px)',
        boxShadow: `0 4px 24px ${accentGlow}, 0 2px 12px rgba(0,0,0,0.45)`,
      }}
      aria-label={`${label} ${neighborhood}`}
    >
      {/* Ambient glow strip at top */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${accent} 40%, ${accent} 60%, transparent 100%)`,
          opacity: 0.5,
        }}
      />

      <div className="px-4 py-3 flex items-center gap-3">

        {/* Icon badge */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
          style={{ backgroundColor: accentDim, border: `1px solid ${accentBorder}` }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          {/* Status label */}
          <p
            className="text-[9px] font-black uppercase tracking-[0.26em] leading-none mb-0.5"
            style={{ color: isReturning ? 'rgba(251,191,36,0.55)' : 'rgba(34,217,238,0.55)' }}
          >
            {label}
          </p>

          {/* Neighborhood name — big, bold, italic */}
          <p
            className="text-[17px] font-black italic leading-tight truncate"
            style={{
              color: '#ffffff',
              textShadow: `0 0 20px ${accent}33`,
              letterSpacing: '-0.01em',
            }}
          >
            {neighborhood}
          </p>

          {/* Store count */}
          {storeCount > 0 && (
            <p
              className="text-[10px] mt-0.5 leading-none truncate"
              style={{ color: 'rgba(255,255,255,0.32)' }}
            >
              {isReturning
                ? `${storeCount} ${storeCount === 1 ? 'store' : 'stores'} to discover here`
                : `${storeCount} ${storeCount === 1 ? 'store' : 'stores'} to discover here`}
            </p>
          )}
        </div>

        {/* Dismiss hint */}
        <div
          className="text-[9px] font-medium flex-shrink-0"
          style={{ color: 'rgba(255,255,255,0.14)' }}
        >
          tap
        </div>
      </div>
    </motion.button>
  );
}
