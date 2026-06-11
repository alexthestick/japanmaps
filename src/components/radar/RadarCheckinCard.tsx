/**
 * RadarCheckinCard
 *
 * The approach + check-in card that slides up from the bottom of the map
 * when the user is within 150m of a store in Radar mode.
 *
 * Three emotional states drive the entire visual language:
 *
 *   DISCOVERY  — never stamped this store. Cyan energy, forward-leaning CTA.
 *   REUNION    — already stamped + verified. Green warmth, "you've been here"
 *                feel, last visit date shown, no urgent CTA.
 *   VERIFY     — stamped but GPS was weak. Amber, re-verify prompt.
 *
 * Four internal UI states:
 *   idle        → approaching (slim) or in_range (expanded with CTA)
 *   checking_in → spinner, waiting for Edge Function response
 *   success     → green flash "Stamped ✓", auto-dismisses after 3s
 *   too_far     → card shakes, shows exact distance, resets after 2.5s
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Instagram, X } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { MAIN_CATEGORY_COLORS } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { ikUrl } from '../../utils/ikUrl';
import { getHoursStatus } from '../../utils/hoursParser';
import type { Store } from '../../types/store';

// ─── Types ────────────────────────────────────────────────────────────────────

type UiState = 'idle' | 'checking_in' | 'success' | 'too_far';

interface TooFarInfo {
  distanceMeters: number;
  requiredMeters: number;
}

interface CachedStatus {
  hasCheckin: boolean;
  verified: boolean;
  visitedAt: string | null;   // ISO timestamp of the stamp — for "Last visited" display
}

export interface RadarCheckinCardProps {
  store: Store;
  distance: number;
  checkinRadius: number;
  isInRange: boolean;
  nearbyCount: number;
  onNextStore: () => void;
  userPosition: { latitude: number; longitude: number; accuracy?: number };
  onCheckinSuccess: (storeName: string, isVerification: boolean) => void;
  onDismiss: () => void;
}

// ─── Accent theme per emotional state ────────────────────────────────────────

type StoreState = 'discovery' | 'reunion' | 'verify';

const THEME = {
  discovery: {
    color:    '#22D9EE',
    rgba:     'rgba(34,217,238,',
    dimColor: 'rgba(34,217,238,0.7)',
  },
  reunion: {
    color:    '#10b981',
    rgba:     'rgba(16,185,129,',
    dimColor: 'rgba(16,185,129,0.7)',
  },
  verify: {
    color:    '#fbbf24',
    rgba:     'rgba(251,191,36,',
    dimColor: 'rgba(251,191,36,0.7)',
  },
} as const;

// ─── Helper: compact date like "Dec 3" ───────────────────────────────────────

function formatVisitDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RadarCheckinCard({
  store,
  distance,
  checkinRadius,
  isInRange,
  nearbyCount,
  onNextStore,
  userPosition,
  onCheckinSuccess,
  onDismiss,
}: RadarCheckinCardProps) {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [uiState, setUiState] = useState<UiState>('idle');
  const [tooFarInfo, setTooFarInfo] = useState<TooFarInfo | null>(null);
  const [existingCheckin, setExistingCheckin] = useState<CachedStatus | null>(null);
  const [shake, setShake] = useState(false);

  const statusCache = useRef<Map<string, CachedStatus>>(new Map());
  const lastFetchedStore = useRef<string | null>(null);

  // ── Fetch checkin status when store changes ──────────────────────────────
  useEffect(() => {
    if (!user) return;
    if (lastFetchedStore.current === store.id) return;
    lastFetchedStore.current = store.id;

    const cached = statusCache.current.get(store.id);
    if (cached) { setExistingCheckin(cached); return; }

    supabase
      .from('gps_checkins')
      .select('verified, visited_at')
      .eq('user_id', user.id)
      .eq('store_id', store.id)
      .maybeSingle()
      .then(({ data }) => {
        const row = data as { verified: boolean; visited_at: string | null } | null;
        const status: CachedStatus = row
          ? { hasCheckin: true, verified: row.verified, visitedAt: row.visited_at }
          : { hasCheckin: false, verified: false, visitedAt: null };
        statusCache.current.set(store.id, status);
        setExistingCheckin(status);
      });
  }, [store.id, user]);

  // Reset ui state when store changes
  useEffect(() => {
    setUiState('idle');
    setTooFarInfo(null);
    setShake(false);
  }, [store.id]);

  // ── Check-in handler ──────────────────────────────────────────────────────
  const handleStampPress = useCallback(async () => {
    if (!user) { navigate('/login'); return; }
    setUiState('checking_in');

    const { data, error } = await supabase.functions.invoke('gps-checkin', {
      body: {
        store_id: store.id,
        latitude: userPosition.latitude,
        longitude: userPosition.longitude,
        accuracy_meters: userPosition.accuracy ?? null,
      },
    });

    const edgeErrorCode = data?.error;
    const isNetworkError = !!error && !edgeErrorCode;

    if (error || edgeErrorCode) {
      if (edgeErrorCode === 'too_far' && data) {
        setTooFarInfo({ distanceMeters: data.distance_meters, requiredMeters: data.required_meters });
      } else if (isNetworkError) {
        setTooFarInfo({ distanceMeters: -1, requiredMeters: -1 });
      }
      setUiState('too_far');
      setShake(true);
      setTimeout(() => { setShake(false); setUiState('idle'); setTooFarInfo(null); }, 2500);
      return;
    }

    // Success
    const wasReVerification = existingCheckin?.hasCheckin === true && !existingCheckin?.verified;
    const now = new Date().toISOString();
    const newStatus: CachedStatus = {
      hasCheckin: true,
      verified: data.checkin.verified,
      visitedAt: now,
    };
    statusCache.current.set(store.id, newStatus);
    setExistingCheckin(newStatus);
    setUiState('success');

    onCheckinSuccess(store.name, wasReVerification);
    setTimeout(() => { onDismiss(); }, 3000);
  }, [user, store.id, store.name, userPosition, existingCheckin, navigate, onCheckinSuccess, onDismiss]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const alreadyVerified  = existingCheckin?.hasCheckin && existingCheckin?.verified;
  const isReVerification = existingCheckin?.hasCheckin && !existingCheckin?.verified;

  const storeState: StoreState = alreadyVerified
    ? 'reunion'
    : isReVerification
      ? 'verify'
      : 'discovery';

  const theme = THEME[storeState];
  const lastVisited = formatVisitDate(existingCheckin?.visitedAt ?? null);

  // ── Computed values ───────────────────────────────────────────────────────
  const photo    = store.photos?.[0];
  const photoUrl = photo ? ikUrl(photo, 'thumb') : null;
  const hoursStatus = getHoursStatus(store.hours);

  // ── Button content ────────────────────────────────────────────────────────
  const buttonContent = () => {
    if (uiState === 'checking_in') {
      return (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Stamping…
        </span>
      );
    }
    if (uiState === 'success')   return isReVerification ? 'Verified ✓' : 'Stamped ✓';
    if (uiState === 'too_far') {
      if (!tooFarInfo) return 'Not close enough';
      if (tooFarInfo.distanceMeters === -1) return 'Connection error — try again';
      return `${tooFarInfo.distanceMeters}m away — need ${tooFarInfo.requiredMeters}m`;
    }
    if (isReVerification) return '↑ Verify Stamp';
    return 'Stamp Passport';
  };

  const buttonStyle = (): React.CSSProperties => {
    if (uiState === 'success') {
      return { backgroundColor: 'rgba(16,185,129,0.2)', color: '#10b981', border: '2px solid rgba(16,185,129,0.5)' };
    }
    if (uiState === 'too_far') {
      return { backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171', border: '2px solid rgba(239,68,68,0.4)', fontSize: '0.72rem' };
    }
    if (isReVerification) {
      return { backgroundColor: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '2px solid rgba(251,191,36,0.5)', boxShadow: '0 0 16px rgba(251,191,36,0.2)' };
    }
    // Discovery — full cyan fill
    return { backgroundColor: '#22D9EE', color: '#0a0a0f', border: '2px solid rgba(34,217,238,0.9)', boxShadow: '0 0 20px rgba(34,217,238,0.3)', fontWeight: 700 };
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      animate={shake ? { x: [0, -10, 10, -8, 8, -5, 5, -3, 3, 0] } : { x: 0 }}
      transition={shake ? { duration: 0.5, ease: 'easeOut' } : {}}
      className="relative w-full overflow-hidden rounded-2xl backdrop-blur-md"
      style={{
        backgroundColor: storeState === 'reunion'
          ? 'rgba(10, 14, 12, 0.95)'   // slightly green-tinted bg for reunion
          : 'rgba(10, 10, 15, 0.93)',
        border: isInRange
          ? `2px solid ${theme.rgba}0.65)`
          : `1px solid ${theme.rgba}${storeState === 'reunion' ? '0.2)' : '0.25)'}`,
        boxShadow: isInRange
          ? `0 0 28px ${theme.rgba}${storeState === 'reunion' ? '0.12)' : '0.18)'}), 0 4px 20px rgba(0,0,0,0.5)`
          : '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* ── Dismiss button ────────────────────────────────────────────────── */}
      <button
        onClick={onDismiss}
        className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full transition-all active:scale-90"
        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        aria-label="Dismiss"
      >
        <X className="w-3 h-3 text-gray-400" />
      </button>

      {/* ── Top row ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pl-4 pr-8 py-3">

        {/* Store photo — reunion gets a soft green ring */}
        <div
          className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 relative"
          style={{
            backgroundColor: `${theme.rgba}0.08)`,
            border: `1px solid ${theme.rgba}0.25)`,
          }}
        >
          {photoUrl ? (
            <img src={photoUrl} alt={store.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span style={{ color: theme.color, opacity: 0.5, fontSize: 20, lineHeight: 1 }}>◎</span>
            </div>
          )}
          {/* Small stamp indicator on photo for reunion mode */}
          {storeState === 'reunion' && (
            <div
              className="absolute bottom-0 right-0 w-4 h-4 rounded-tl-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(16,185,129,0.9)' }}
            >
              <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: 900 }}>✓</span>
            </div>
          )}
        </div>

        {/* Store name + metadata row */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-tight truncate">{store.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">

            {/* Category pill */}
            {(store.categories?.[0] || store.mainCategory) && (
              <span
                className="flex-shrink-0 font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${MAIN_CATEGORY_COLORS[store.mainCategory ?? 'Fashion'] ?? theme.color}20`,
                  color: MAIN_CATEGORY_COLORS[store.mainCategory ?? 'Fashion'] ?? theme.color,
                  fontSize: '0.63rem',
                }}
              >
                {store.categories?.[0] || store.mainCategory}
              </span>
            )}

            {/* Price */}
            {store.priceRange && (
              <span className="text-gray-400 flex-shrink-0" style={{ fontSize: '0.63rem', letterSpacing: '0.05em' }}>
                {store.priceRange}
              </span>
            )}

            {/* Find count */}
            {store.haulCount > 0 && (
              <span className="text-gray-500 flex-shrink-0 flex items-center gap-0.5" style={{ fontSize: '0.63rem' }}>
                <span style={{ color: theme.color, opacity: 0.7 }}>◎</span>
                {store.haulCount}
              </span>
            )}

            {/* Hours status */}
            {hoursStatus.status === 'open' && (
              <span className="flex-shrink-0 flex items-center gap-0.5" style={{ fontSize: '0.63rem', color: '#10b981' }}>
                <span>●</span><span>Closes {hoursStatus.closesAt}</span>
              </span>
            )}
            {hoursStatus.status === 'opens_soon' && (
              <span className="flex-shrink-0 flex items-center gap-0.5" style={{ fontSize: '0.63rem', color: '#fbbf24' }}>
                <span>●</span><span>Opens {hoursStatus.opensAt}</span>
              </span>
            )}
            {(hoursStatus.status === 'closed' || hoursStatus.status === 'closed_today') && (
              <span className="flex-shrink-0 flex items-center gap-0.5" style={{ fontSize: '0.63rem', color: '#f87171' }}>
                <span>●</span>
                <span>
                  {hoursStatus.status === 'closed' && hoursStatus.opensAt
                    ? `Opens ${hoursStatus.opensAt}`
                    : 'Closed today'}
                </span>
              </span>
            )}
            {hoursStatus.status === 'open_24h' && (
              <span className="flex-shrink-0 flex items-center gap-0.5" style={{ fontSize: '0.63rem', color: '#10b981' }}>
                <span>●</span><span>Open 24hrs</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: distance / in-range dot */}
        {!isInRange ? (
          <div className="flex-shrink-0 text-right">
            <p className="text-sm font-bold tabular-nums leading-tight" style={{ color: theme.color }}>
              {Math.round(distance)}m
            </p>
            <p className="text-gray-500 text-xs">away</p>
          </div>
        ) : (
          <div className="flex-shrink-0">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: theme.color, boxShadow: `0 0 8px ${theme.color}` }}
            />
          </div>
        )}

        {/* Cycle chip */}
        {nearbyCount > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNextStore(); }}
            className="flex-shrink-0 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
            style={{
              backgroundColor: `${theme.rgba}0.1)`,
              border: `1px solid ${theme.rgba}0.35)`,
              color: theme.color,
            }}
          >
            +{nearbyCount - 1}
          </button>
        )}
      </div>

      {/* ── Expanded CTA area ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isInRange && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mx-4" style={{ height: 1, backgroundColor: `${theme.rgba}0.15)` }} />

            <div className="px-4 pb-4 pt-3 space-y-2.5">

              {/* ── REUNION mode — warm, settled, no urgent CTA ──── */}
              {storeState === 'reunion' && uiState === 'idle' && (
                <>
                  {/* "Welcome back" line */}
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#10b981', fontSize: '0.75rem' }}>◎</span>
                    <p className="text-sm font-medium" style={{ color: '#10b981' }}>
                      You've been here
                      {lastVisited ? (
                        <span className="font-normal text-xs ml-1.5" style={{ color: 'rgba(16,185,129,0.65)' }}>
                          · {lastVisited}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  {/* Description — still useful context */}
                  {store.description && (
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                      {store.description.slice(0, 100)}{store.description.length > 100 ? '…' : ''}
                    </p>
                  )}
                  {store.instagram && (
                    <a
                      href={`https://instagram.com/${store.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium transition-opacity active:opacity-70"
                      style={{ color: 'rgba(168,85,247,0.9)' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <Instagram className="w-3 h-3 flex-shrink-0" />
                      @{store.instagram.replace('@', '')}
                    </a>
                  )}
                  {/* Soft "already stamped" indicator — no button, no urgency */}
                  <div
                    className="w-full py-2.5 rounded-xl text-sm text-center"
                    style={{
                      backgroundColor: 'rgba(16,185,129,0.07)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      color: 'rgba(16,185,129,0.6)',
                    }}
                  >
                    Stamped ✓
                  </div>
                </>
              )}

              {/* ── DISCOVERY / VERIFY mode — standard CTA flow ──── */}
              {storeState !== 'reunion' && (
                <>
                  {store.description && uiState === 'idle' && (
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                      {store.description.slice(0, 100)}{store.description.length > 100 ? '…' : ''}
                    </p>
                  )}
                  {store.instagram && uiState === 'idle' && (
                    <a
                      href={`https://instagram.com/${store.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium transition-opacity active:opacity-70"
                      style={{ color: 'rgba(168,85,247,0.9)' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <Instagram className="w-3 h-3 flex-shrink-0" />
                      @{store.instagram.replace('@', '')}
                    </a>
                  )}
                  {(userPosition.accuracy ?? 0) > 25 && uiState === 'idle' && (
                    <p className="text-xs text-center" style={{ color: 'rgba(251,191,36,0.8)' }}>
                      GPS weak · check-in radius widened to {Math.round(checkinRadius)}m
                    </p>
                  )}
                  {isReVerification && uiState === 'idle' && (
                    <p className="text-xs text-center" style={{ color: 'rgba(251,191,36,0.7)' }}>
                      Previous stamp was unverified — re-check in with good GPS to verify it
                    </p>
                  )}
                  <button
                    onClick={handleStampPress}
                    disabled={uiState === 'checking_in'}
                    className="w-full py-3 rounded-xl text-sm transition-all active:scale-[0.98] disabled:cursor-default"
                    style={buttonStyle()}
                  >
                    {buttonContent()}
                  </button>
                </>
              )}

              {/* Success state (shown over both modes briefly before dismiss) */}
              {uiState === 'success' && storeState === 'reunion' && (
                <button
                  disabled
                  className="w-full py-3 rounded-xl text-sm"
                  style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#10b981', border: '2px solid rgba(16,185,129,0.5)' }}
                >
                  Verified ✓
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
