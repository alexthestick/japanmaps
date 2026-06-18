/**
 * RadarOnboardingCard
 *
 * One-time welcome overlay shown the first time a user activates Radar mode.
 * Explains the core loop: walk nearby → stamp → complete quests.
 *
 * Persists dismissal via localStorage key 'radar-onboarded' so it never
 * shows again after the first session.
 *
 * Auto-dismisses after 8 seconds. Tap anywhere to dismiss early.
 * z-[45] — above map UI (z-30) but below HUD (z-50) so the HUD stays visible.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Stamp, Trophy } from 'lucide-react';

const STORAGE_KEY = 'radar-onboarded';
const AUTO_DISMISS_MS = 8000;

export function hasSeenRadarOnboarding(): boolean {
  try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; }
}

export function markRadarOnboardingSeen(): void {
  try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
}

interface RadarOnboardingCardProps {
  onDismiss: () => void;
}

const STEPS = [
  {
    Icon: Navigation,
    color: '#22D9EE',
    title: 'Walk to a store',
    body: 'Gold markers show quest targets. Get within 50m and the card slides up.',
  },
  {
    Icon: Stamp,
    color: '#a855f7',
    title: 'Stamp it',
    body: 'GPS verifies you\'re there. Stamped stores turn green — no re-visits needed.',
  },
  {
    Icon: Trophy,
    color: '#f59e0b',
    title: 'Complete quests',
    body: 'Stamp every store in a neighborhood to unlock its trophy on your profile.',
  },
] as const;

export function RadarOnboardingCard({ onDismiss }: RadarOnboardingCardProps) {
  useEffect(() => {
    const t = setTimeout(() => {
      markRadarOnboardingSeen();
      onDismiss();
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [onDismiss]);

  function handleDismiss() {
    markRadarOnboardingSeen();
    onDismiss();
  }

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      onClick={handleDismiss}
      className="absolute left-4 right-4 z-[45] cursor-pointer"
      style={{ bottom: 'calc(9.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div
        className="w-full rounded-2xl px-5 py-4 backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(6, 8, 14, 0.97)',
          border: '1px solid rgba(34,217,238,0.22)',
          boxShadow: '0 0 32px rgba(34,217,238,0.08), 0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p
              className="text-xs font-black uppercase tracking-[0.18em]"
              style={{ color: 'rgba(34,217,238,0.6)' }}
            >
              Radar mode
            </p>
            <p className="text-white font-bold text-[15px] leading-tight mt-0.5">
              How it works
            </p>
          </div>
          <span
            className="text-[10px] font-semibold"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            Tap to close
          </span>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map(({ Icon, color, title, body }, i) => (
            <div key={i} className="flex items-start gap-3">
              {/* Icon badge */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  backgroundColor: `${color}14`,
                  border: `1px solid ${color}30`,
                }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-[13px] font-semibold leading-tight">{title}</p>
                <p
                  className="text-[11px] mt-0.5 leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.42)' }}
                >
                  {body}
                </p>
              </div>

              {/* Step number */}
              <span
                className="text-[10px] font-black flex-shrink-0 mt-0.5"
                style={{ color: 'rgba(255,255,255,0.15)' }}
              >
                {i + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Thin cyan progress bar auto-dismiss indicator */}
        <div
          className="mt-4 rounded-full overflow-hidden"
          style={{ height: 2, backgroundColor: 'rgba(34,217,238,0.08)' }}
        >
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
            style={{ height: '100%', backgroundColor: 'rgba(34,217,238,0.4)', borderRadius: 9999 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
