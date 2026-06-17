/**
 * RadarFieldReport
 *
 * Full-screen post-session debrief overlay.
 * Shown after Radar exit when ≥1 store was stamped.
 * Replaces RadarSessionSummary — manual dismiss only (no auto-close).
 *
 * Design: Strava post-run energy on a Pokémon GO canvas.
 * Colors: emerald green (#10b981) on near-black.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, MapPin, PenLine, Share2, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import type { Store } from '../../types/store';
import { ikUrl } from '../../utils/ikUrl';
import { ShareFieldReportCard } from './ShareFieldReportCard';

// ─── Count-up animation ───────────────────────────────────────────────────────
// Counts from 0 → target over `duration` ms using ease-out cubic.
// Uses requestAnimationFrame for a smooth, GPU-friendly animation.
function CountUp({ target, duration = 900 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let rafId: number;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setCount(Math.round(eased * target));
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return <>{count}</>;
}

// ─── Download helper ──────────────────────────────────────────────────────────
function triggerDownload(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = 'lost-in-transit-field-report.png';
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RadarFieldReportProps {
  stamps: number;
  distanceKm: number;
  durationMinutes: number;
  neighborhood: string | null;
  stores: Store[];
  onDismiss: () => void;
  /** Called when user wants to log a find for a specific store. */
  onLogFind: (store: Store) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function RadarFieldReport({
  stamps,
  distanceKm,
  durationMinutes,
  neighborhood,
  stores,
  onDismiss,
  onLogFind,
}: RadarFieldReportProps) {
  // ── Share card ref + state ────────────────────────────────────────────────
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  // ── Capture + share ───────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    if (!shareCardRef.current || isSharing) return;
    setIsSharing(true);

    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#030706',
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) { setIsSharing(false); return; }

        const file = new File([blob], 'lost-in-transit-field-report.png', { type: 'image/png' });

        // Native share API (iOS / Android) — preferred path
        if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: 'Lost in Transit — Field Report' });
          } catch (err) {
            // User cancelled — don't fallback to download
            if ((err as Error).name !== 'AbortError') {
              triggerDownload(blob);
            }
          }
        } else {
          // Desktop fallback: trigger PNG download
          triggerDownload(blob);
        }

        setIsSharing(false);
      }, 'image/png');
    } catch (err) {
      console.error('[ShareFieldReport] capture failed:', err);
      setIsSharing(false);
    }
  }, [isSharing]);

  // ── Stat strings ─────────────────────────────────────────────────────────
  const distanceStr = distanceKm < 0.1
    ? `${Math.round(distanceKm * 1000)}m`
    : `${distanceKm.toFixed(1)}km`;

  const durationStr = durationMinutes < 1
    ? '< 1 min'
    : durationMinutes >= 60
      ? `${(durationMinutes / 60).toFixed(1)} hr`
      : `${Math.round(durationMinutes)} min`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[300] flex flex-col overflow-hidden"
      style={{
        backgroundColor: 'rgba(3, 7, 6, 0.98)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* ── Static green bloom — top center (no animation = no GPU repaint) ─ */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 440,
          height: 320,
          background:
            'radial-gradient(ellipse at center top, rgba(16,185,129,0.13) 0%, transparent 68%)',
          filter: 'blur(30px)',
        }}
      />

      {/* ── Slide-in content wrapper ──────────────────────────────────────── */}
      <motion.div
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 14, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300, delay: 0.06 }}
        className="relative flex-1 flex flex-col overflow-hidden"
      >

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <span
            className="text-xs font-black uppercase tracking-[0.28em]"
            style={{ color: 'rgba(16,185,129,0.65)' }}
          >
            ◎ Field Report
          </span>

          <div className="flex items-center gap-2">
            {/* Share button */}
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform disabled:opacity-50"
              style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.22)' }}
              aria-label="Share field report"
            >
              {isSharing
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#10b981' }} />
                : <Share2 className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
              }
            </button>

            {/* Close button */}
            <button
              onClick={onDismiss}
              className="w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
              aria-label="Close field report"
            >
              <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.38)' }} />
            </button>
          </div>
        </div>

        {/* ── Hero: animated stamp count ─────────────────────────────────── */}
        <motion.div
          initial={{ scale: 0.74, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 240, delay: 0.18 }}
          className="flex flex-col items-center justify-center py-7"
        >
          {/* Glow halo behind the number */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute pointer-events-none"
              style={{
                width: 130,
                height: 130,
                background:
                  'radial-gradient(circle, rgba(16,185,129,0.24) 0%, transparent 72%)',
                filter: 'blur(20px)',
              }}
            />
            <span
              className="relative tabular-nums leading-none"
              style={{
                fontSize: 88,
                fontWeight: 900,
                color: '#10b981',
                textShadow: '0 0 52px rgba(16,185,129,0.52)',
              }}
            >
              <CountUp target={stamps} />
            </span>
          </div>
          <p
            className="mt-2 text-xs font-bold uppercase tracking-[0.22em]"
            style={{ color: 'rgba(255,255,255,0.28)' }}
          >
            {stamps === 1 ? 'Store Stamped' : 'Stores Stamped'}
          </p>
        </motion.div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.33, duration: 0.36, ease: 'easeOut' }}
          className="mx-5 rounded-2xl flex items-stretch overflow-hidden"
          style={{
            backgroundColor: 'rgba(255,255,255,0.033)',
            border: '1px solid rgba(16,185,129,0.1)',
          }}
        >
          {/* Distance */}
          <div className="flex-1 flex flex-col items-center py-4 px-2">
            <span className="text-xl font-black text-white tabular-nums">{distanceStr}</span>
            <span
              className="text-[10px] uppercase tracking-wide mt-1"
              style={{ color: 'rgba(255,255,255,0.27)' }}
            >
              Walked
            </span>
          </div>

          <div className="w-px" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }} />

          {/* Duration */}
          <div className="flex-1 flex flex-col items-center py-4 px-2">
            <span className="text-xl font-black text-white tabular-nums">{durationStr}</span>
            <span
              className="text-[10px] uppercase tracking-wide mt-1"
              style={{ color: 'rgba(255,255,255,0.27)' }}
            >
              Duration
            </span>
          </div>

          {neighborhood && (
            <>
              <div className="w-px" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }} />
              {/* Neighborhood */}
              <div className="flex-1 flex flex-col items-center py-4 px-3 min-w-0">
                <span className="text-sm font-black text-white leading-tight truncate w-full text-center">
                  {neighborhood}
                </span>
                <span
                  className="text-[10px] uppercase tracking-wide mt-1"
                  style={{ color: 'rgba(255,255,255,0.27)' }}
                >
                  Area
                </span>
              </div>
            </>
          )}
        </motion.div>

        {/* ── Stores visited ─────────────────────────────────────────────── */}
        {stores.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.47, duration: 0.3 }}
            className="flex-1 flex flex-col min-h-0 mt-5"
          >
            <p
              className="px-5 mb-2 text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: 'rgba(16,185,129,0.42)' }}
            >
              Visited Today
            </p>

            {/* Scrollable store list */}
            <div
              className="flex-1 overflow-y-auto px-5 pb-3"
              style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            >
              {stores.map((store, index) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.53 + index * 0.07,
                    duration: 0.26,
                    ease: 'easeOut',
                  }}
                  className="flex items-center gap-3 py-3"
                  style={{
                    borderBottom:
                      index < stores.length - 1
                        ? '1px solid rgba(255,255,255,0.05)'
                        : 'none',
                  }}
                >
                  {/* Store thumbnail */}
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    {store.photos[0] ? (
                      <img
                        src={ikUrl(store.photos[0], 'thumb')}
                        alt={store.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin
                          className="w-4 h-4"
                          style={{ color: 'rgba(255,255,255,0.14)' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Store name + neighborhood */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-tight truncate">
                      {store.name}
                    </p>
                    {store.neighborhood && (
                      <p
                        className="text-xs mt-0.5 truncate"
                        style={{ color: 'rgba(255,255,255,0.33)' }}
                      >
                        {store.neighborhood}
                      </p>
                    )}
                  </div>

                  {/* Log a Find button */}
                  <button
                    onClick={() => onLogFind(store)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 active:scale-95 transition-transform"
                    style={{
                      backgroundColor: 'rgba(16,185,129,0.09)',
                      color: '#10b981',
                      border: '1px solid rgba(16,185,129,0.22)',
                    }}
                  >
                    <PenLine className="w-3 h-3" />
                    <span>Log</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Footer CTA ─────────────────────────────────────────────────── */}
        <div className="px-5 pt-2 pb-3">
          <button
            onClick={onDismiss}
            className="w-full py-[15px] rounded-2xl font-bold text-sm transition-all duration-200 active:scale-[0.98]"
            style={{
              backgroundColor: 'rgba(16,185,129,0.1)',
              color: '#10b981',
              border: '1px solid rgba(16,185,129,0.24)',
            }}
          >
            Back to Map
          </button>
        </div>

      </motion.div>

    </motion.div>

      {/* ── Off-screen share card — rendered via portal to document.body ────
          position:fixed inside a Framer Motion animated div doesn't escape
          to the viewport (CSS transforms create a new containing block).
          Portal bypasses this entirely — the card lives outside all transforms
          so left:-9999px genuinely puts it off-screen.
          Images are pre-loaded while the Field Report is visible so capture
          fires instantly when the user taps Share. */}
      {createPortal(
        <ShareFieldReportCard
          stamps={stamps}
          distanceKm={distanceKm}
          durationMinutes={durationMinutes}
          neighborhood={neighborhood}
          stores={stores}
          cardRef={shareCardRef}
        />,
        document.body
      )}
    </>
  );
}
