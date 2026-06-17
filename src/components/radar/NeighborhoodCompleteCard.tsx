/**
 * NeighborhoodCompleteCard
 *
 * Full-screen celebration overlay shown the first time a user stamps
 * every quest store in a neighborhood during a Radar session.
 *
 * Design language: Pokémon GO gym badge × Strava achievement.
 * - Concentric animated rings pulse outward
 * - Gold star badge with neighborhood name in large italic type
 * - Stamp count + "View the guide" CTA linking to the blog article
 * - Auto-dismisses after 5 seconds; also manually dismissible
 *
 * Rendered in an AnimatePresence in HomePage so it slides over everything.
 * z-[250] — above RadarHUD (z-50) and BottomSheet (z-[200/201]).
 */

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export interface NeighborhoodCompleteCardProps {
  neighborhood: string;
  /** Total stores completed (for copy) */
  storeCount: number;
  /** Blog article slug — "View the guide" links to /blog/{questSlug} */
  questSlug: string;
  /** Called when the card should be dismissed */
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 5000;
const GOLD = '#f59e0b';
const GOLD_DIM = 'rgba(245,158,11,0.18)';
const GOLD_GLOW = 'rgba(245,158,11,0.08)';
const GOLD_BORDER = 'rgba(245,158,11,0.32)';

export function NeighborhoodCompleteCard({
  neighborhood,
  storeCount,
  questSlug,
  onDismiss,
}: NeighborhoodCompleteCardProps) {
  // Auto-dismiss
  useEffect(() => {
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const handleViewGuide = useCallback(() => {
    onDismiss();
    // Navigate to article — open in same tab
    window.open(`/blog/${questSlug}`, '_blank', 'noopener');
  }, [onDismiss, questSlug]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="fixed inset-0 z-[250] flex flex-col items-center justify-center"
      style={{
        backgroundColor: 'rgba(3, 7, 6, 0.97)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Close button — top right */}
      <button
        onClick={onDismiss}
        className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full"
        style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          zIndex: 10,
        }}
        aria-label="Close"
      >
        <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.38)' }} />
      </button>

      {/* ── Concentric pulsing rings ─────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 2.5 + i * 0.6, opacity: 0 }}
            transition={{
              duration: 2.2,
              ease: 'easeOut',
              delay: i * 0.35,
              repeat: Infinity,
              repeatDelay: 0.8,
            }}
            style={{
              position: 'absolute',
              width: 160,
              height: 160,
              borderRadius: '50%',
              border: `1.5px solid ${GOLD}`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* ── Central badge ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 220, delay: 0.08 }}
        className="relative flex flex-col items-center"
      >
        {/* Gold star circle */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
          style={{
            backgroundColor: GOLD_DIM,
            border: `2px solid ${GOLD_BORDER}`,
            boxShadow: `0 0 48px ${GOLD_GLOW}, 0 0 96px ${GOLD_GLOW}`,
          }}
        >
          <span
            style={{
              fontSize: 52,
              lineHeight: 1,
              filter: `drop-shadow(0 0 16px ${GOLD})`,
            }}
          >
            ★
          </span>
        </div>

        {/* Achievement label */}
        <p
          className="text-[11px] font-black uppercase tracking-[0.3em] mb-3"
          style={{ color: 'rgba(245,158,11,0.65)' }}
        >
          Neighborhood Complete
        </p>

        {/* Neighborhood name */}
        <h2
          className="text-4xl font-black italic text-white text-center px-8 mb-2"
          style={{
            letterSpacing: '-0.02em',
            textShadow: `0 0 40px ${GOLD}44`,
            lineHeight: 1.1,
          }}
        >
          {neighborhood}
        </h2>

        {/* Stamp count */}
        <p
          className="text-sm font-medium mb-10"
          style={{ color: 'rgba(255,255,255,0.38)' }}
        >
          All {storeCount} {storeCount === 1 ? 'store' : 'stores'} stamped
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col items-center gap-3 w-72">
          {/* View the guide */}
          <button
            onClick={handleViewGuide}
            className="w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200 active:scale-[0.98]"
            style={{
              backgroundColor: GOLD_DIM,
              color: GOLD,
              border: `1px solid ${GOLD_BORDER}`,
              boxShadow: `0 0 20px ${GOLD_GLOW}`,
            }}
          >
            View the guide →
          </button>

          {/* Keep exploring */}
          <button
            onClick={onDismiss}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-[0.98]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.45)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            Keep exploring
          </button>
        </div>
      </motion.div>

      {/* Subtle ambient background bloom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${GOLD_GLOW} 0%, transparent 65%)`,
        }}
      />
    </motion.div>
  );
}
