/**
 * RadarCheckinCard
 *
 * The approach + check-in card that slides up from the bottom of the map
 * when the user is within 150m of a store in Radar mode.
 *
 * Four internal UI states:
 *   idle        → approaching (slim) or in_range (expanded with CTA)
 *   checking_in → spinner, waiting for Edge Function response
 *   success     → green flash "Stamped ✓", 2s then callback
 *   too_far     → card shakes, shows exact distance, resets after 2.5s
 *
 * Positioning and slide-up animation are handled by the parent (HomePage).
 * This component only handles its own internal state + shake animation.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Instagram, X } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { MAIN_CATEGORY_COLORS } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { ikUrl } from '../../utils/ikUrl';
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
}

export interface RadarCheckinCardProps {
  store: Store;
  distance: number;         // live distance in metres (updates every GPS tick)
  checkinRadius: number;    // dynamic radius: max(50, accuracy×1.5), capped at 150
  isInRange: boolean;       // distance <= checkinRadius → show stamp CTA
  nearbyCount: number;      // total stores within 150m (including this one)
  onNextStore: () => void;  // cycle to next nearby store
  userPosition: { latitude: number; longitude: number; accuracy?: number };
  onCheckinSuccess: (storeName: string, isVerification: boolean) => void;
  onDismiss: () => void;    // called when user taps X or auto-dismiss timer fires
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

  // Cache: prevents redundant DB calls when GPS boundary fluctuation
  // causes nearbyStore to briefly flip between stores.
  const statusCache = useRef<Map<string, CachedStatus>>(new Map());
  const lastFetchedStore = useRef<string | null>(null);

  // ── Fetch checkin status when store changes ──────────────────────────────
  useEffect(() => {
    if (!user) return;
    if (lastFetchedStore.current === store.id) return; // already fetched this store

    lastFetchedStore.current = store.id;

    // Serve from cache if available — zero DB round trip
    const cached = statusCache.current.get(store.id);
    if (cached) {
      setExistingCheckin(cached);
      return;
    }

    // Direct table query — type-safe via Database['gps_checkins'] and
    // covered by the gps_checkins_select_own RLS policy (auth.uid() = user_id).
    supabase
      .from('gps_checkins')
      .select('verified, visited_at')
      .eq('user_id', user.id)
      .eq('store_id', store.id)
      .maybeSingle()
      .then(({ data }) => {
        // Narrow cast: supabase-js generic inference requires the full Database
        // schema (Views/Enums/CompositeTypes) to resolve correctly — cast the
        // row here until we run a full `supabase gen types` regeneration.
        const row = data as { verified: boolean } | null;
        const status: CachedStatus = row
          ? { hasCheckin: true, verified: row.verified }
          : { hasCheckin: false, verified: false };

        statusCache.current.set(store.id, status);
        setExistingCheckin(status);
      });
  }, [store.id, user]);

  // Reset local ui state when the store changes
  useEffect(() => {
    setUiState('idle');
    setTooFarInfo(null);
    setShake(false);
  }, [store.id]);

  // ── Check-in handler ──────────────────────────────────────────────────────
  const handleStampPress = useCallback(async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setUiState('checking_in');

    const { data, error } = await supabase.functions.invoke('gps-checkin', {
      body: {
        store_id: store.id,
        latitude: userPosition.latitude,
        longitude: userPosition.longitude,
        accuracy_meters: userPosition.accuracy ?? null,
      },
    });

    // ── Error handling ──────────────────────────────────────────────────
    const edgeErrorCode = data?.error;
    // Network/function errors (not a distance rejection) get a distinct message
    const isNetworkError = !!error && !edgeErrorCode;

    if (error || edgeErrorCode) {
      if (edgeErrorCode === 'too_far' && data) {
        setTooFarInfo({
          distanceMeters: data.distance_meters,
          requiredMeters: data.required_meters,
        });
      } else if (isNetworkError) {
        // Pass a sentinel so the button shows a connection message instead of
        // a distance message — the two failures need different copy.
        setTooFarInfo({ distanceMeters: -1, requiredMeters: -1 });
      }
      setUiState('too_far');
      setShake(true);

      setTimeout(() => {
        setShake(false);
        setUiState('idle');
        setTooFarInfo(null);
      }, 2500);
      return;
    }

    // ── Success ─────────────────────────────────────────────────────────
    const wasReVerification = existingCheckin?.hasCheckin === true && !existingCheckin?.verified;
    const newStatus: CachedStatus = { hasCheckin: true, verified: data.checkin.verified };
    statusCache.current.set(store.id, newStatus);
    setExistingCheckin(newStatus);
    setUiState('success');

    // Notify parent immediately so markers + passport cache refresh
    onCheckinSuccess(store.name, wasReVerification);

    // Auto-dismiss after 3s — X button lets user close early
    setTimeout(() => {
      onDismiss();
    }, 3000);
  }, [user, store.id, store.name, userPosition, existingCheckin, navigate, onCheckinSuccess]);

  // ── Derived display logic ─────────────────────────────────────────────────
  const alreadyVerified = existingCheckin?.hasCheckin && existingCheckin?.verified;
  const isReVerification = existingCheckin?.hasCheckin && !existingCheckin?.verified;

  // Accent color: amber for re-verification, cyan otherwise
  const accentColor = isReVerification ? '#fbbf24' : '#22D9EE';
  const accentRgba = isReVerification ? 'rgba(251,191,36,' : 'rgba(34,217,238,';

  const buttonContent = () => {
    if (uiState === 'checking_in') {
      return (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Stamping…
        </span>
      );
    }
    if (uiState === 'success') {
      return alreadyVerified ? 'Verified ✓' : 'Stamped ✓';
    }
    if (uiState === 'too_far') {
      if (!tooFarInfo) return 'Not close enough';
      if (tooFarInfo.distanceMeters === -1) return 'Connection error — try again';
      return `${tooFarInfo.distanceMeters}m away — need ${tooFarInfo.requiredMeters}m`;
    }
    if (alreadyVerified) return 'Stamped ✓';
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
    if (alreadyVerified) {
      return { backgroundColor: `${accentRgba}0.08)`, color: accentColor, border: `2px solid ${accentRgba}0.3)`, opacity: 0.7 };
    }
    if (isReVerification) {
      return { backgroundColor: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '2px solid rgba(251,191,36,0.5)', boxShadow: '0 0 16px rgba(251,191,36,0.2)' };
    }
    // Primary stamp CTA — full cyan fill
    return { backgroundColor: '#22D9EE', color: '#0a0a0f', border: '2px solid rgba(34,217,238,0.9)', boxShadow: '0 0 20px rgba(34,217,238,0.3)', fontWeight: 700 };
  };

  const photo = store.photos?.[0];
  const photoUrl = photo ? ikUrl(photo, 'thumb') : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      // Shake animation fires when uiState === 'too_far'
      animate={shake ? { x: [0, -10, 10, -8, 8, -5, 5, -3, 3, 0] } : { x: 0 }}
      transition={shake ? { duration: 0.5, ease: 'easeOut' } : {}}
      className="relative w-full overflow-hidden rounded-2xl backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(10, 10, 15, 0.93)',
        border: isInRange
          ? `2px solid ${accentRgba}0.65)`
          : '1px solid rgba(34,217,238,0.25)',
        boxShadow: isInRange
          ? `0 0 28px ${accentRgba}0.18), 0 4px 20px rgba(0,0,0,0.5)`
          : '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* ── Dismiss button — always visible ──────────────────────────────── */}
      <button
        onClick={onDismiss}
        className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full transition-all active:scale-90"
        style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        aria-label="Dismiss"
      >
        <X className="w-3 h-3 text-gray-400" />
      </button>

      {/* ── Top row: photo + store info + distance/chip ─────────────────── */}
      {/* pr-8 reserves space for the absolute dismiss button */}
      <div className="flex items-center gap-3 pl-4 pr-8 py-3">

        {/* Store photo */}
        <div
          className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0"
          style={{ backgroundColor: `${accentRgba}0.08)`, border: `1px solid ${accentRgba}0.2)` }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span style={{ color: accentColor, opacity: 0.5, fontSize: 20, lineHeight: 1 }}>◎</span>
            </div>
          )}
        </div>

        {/* Store name + sub-category + price + finds */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-tight truncate">{store.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">

            {/* Sub-category pill — more specific than mainCategory */}
            {(store.categories?.[0] || store.mainCategory) && (
              <span
                className="flex-shrink-0 font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${MAIN_CATEGORY_COLORS[store.mainCategory ?? 'Fashion'] ?? accentColor}20`,
                  color: MAIN_CATEGORY_COLORS[store.mainCategory ?? 'Fashion'] ?? accentColor,
                  fontSize: '0.63rem',
                }}
              >
                {store.categories?.[0] || store.mainCategory}
              </span>
            )}

            {/* Price range */}
            {store.priceRange && (
              <span className="text-gray-400 flex-shrink-0" style={{ fontSize: '0.63rem', letterSpacing: '0.05em' }}>
                {store.priceRange}
              </span>
            )}

            {/* Find count — social proof */}
            {store.haulCount > 0 && (
              <span className="text-gray-500 flex-shrink-0 flex items-center gap-0.5" style={{ fontSize: '0.63rem' }}>
                <span style={{ color: accentColor, opacity: 0.7 }}>◎</span>
                {store.haulCount}
              </span>
            )}
          </div>
        </div>

        {/* Right side: distance counter OR in-range indicator */}
        {!isInRange ? (
          <div className="flex-shrink-0 text-right">
            <p
              className="text-sm font-bold tabular-nums leading-tight"
              style={{ color: accentColor }}
            >
              {Math.round(distance)}m
            </p>
            <p className="text-gray-500 text-xs">away</p>
          </div>
        ) : (
          <div className="flex-shrink-0">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
            />
          </div>
        )}

        {/* "X more nearby" chip — shown when multiple stores are within 150m */}
        {nearbyCount > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNextStore(); }}
            className="flex-shrink-0 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
            style={{
              backgroundColor: `${accentRgba}0.1)`,
              border: `1px solid ${accentRgba}0.35)`,
              color: accentColor,
            }}
          >
            +{nearbyCount - 1}
          </button>
        )}
      </div>

      {/* ── Expanded CTA area: only visible when in_range ───────────────── */}
      <AnimatePresence>
        {isInRange && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            {/* Separator */}
            <div
              className="mx-4"
              style={{ height: 1, backgroundColor: `${accentRgba}0.15)` }}
            />

            <div className="px-4 pb-4 pt-3 space-y-2.5">
              {/* Description snippet — the key "should I walk in?" signal */}
              {store.description && uiState === 'idle' && (
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                  {store.description.slice(0, 100)}{store.description.length > 100 ? '…' : ''}
                </p>
              )}

              {/* Instagram — decision helper when standing 30m away */}
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

              {/* GPS weak disclaimer when accuracy is poor */}
              {(userPosition.accuracy ?? 0) > 25 && uiState === 'idle' && (
                <p className="text-xs mb-2.5 text-center" style={{ color: 'rgba(251,191,36,0.8)' }}>
                  GPS weak · check-in radius widened to {Math.round(checkinRadius)}m
                </p>
              )}

              {/* Re-verify hint */}
              {isReVerification && uiState === 'idle' && (
                <p className="text-xs mb-2.5 text-center" style={{ color: 'rgba(251,191,36,0.7)' }}>
                  Previous stamp was unverified — re-check in with good GPS to verify it
                </p>
              )}

              <button
                onClick={handleStampPress}
                disabled={uiState === 'checking_in' || alreadyVerified === true}
                className="w-full py-3 rounded-xl text-sm transition-all active:scale-[0.98] disabled:cursor-default"
                style={buttonStyle()}
              >
                {buttonContent()}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
