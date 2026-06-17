/**
 * ShareFieldReportCard
 *
 * Off-screen 9:16 card captured by html2canvas for sharing/downloading.
 * Rendered at 540×960 CSS pixels → captured at scale:2 → 1080×1920 PNG.
 *
 * Design rules:
 *   - ALL styles inline (Tailwind classes are not computed in the capture context)
 *   - crossOrigin="anonymous" on every <img> (required for html2canvas useCORS)
 *   - loading="eager" on images so they're decoded before capture fires
 *   - No SVG filters, no backdrop-filter (html2canvas doesn't support them)
 *   - Glow via box-shadow / text-shadow only
 *
 * Mounted off-screen in RadarFieldReport:
 *   position: fixed; left: -9999px; top: 0; pointer-events: none;
 */

import type { Store } from '../../types/store';
import { ikUrl } from '../../utils/ikUrl';

// ── Constants ─────────────────────────────────────────────────────────────────

export const CARD_W = 540;
export const CARD_H = 960;

const BG          = '#030706';
const EMERALD     = '#10b981';
const EMERALD_DIM = 'rgba(16,185,129,0.45)';
const EMERALD_FAINT = 'rgba(16,185,129,0.1)';
const EMERALD_BORDER = 'rgba(16,185,129,0.14)';
const WHITE       = '#ffffff';
const WHITE_DIM   = 'rgba(255,255,255,0.28)';
const WHITE_FAINT = 'rgba(255,255,255,0.06)';
const CYAN        = '#22D9EE';
const DOMAIN      = 'lostintransitjp.com';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDistance(km: number): string {
  if (km < 0.1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

function fmtDuration(min: number): string {
  if (min < 1)  return '< 1 min';
  if (min >= 60) return `${(min / 60).toFixed(1)} hr`;
  return `${Math.round(min)} min`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ShareFieldReportCardProps {
  stamps: number;
  distanceKm: number;
  durationMinutes: number;
  neighborhood: string | null;
  stores: Store[];
  /** ref forwarded from RadarFieldReport so html2canvas can target this element */
  cardRef: React.RefObject<HTMLDivElement>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ShareFieldReportCard({
  stamps,
  distanceKm,
  durationMinutes,
  neighborhood,
  stores,
  cardRef,
}: ShareFieldReportCardProps) {
  // Show up to 3 store photos
  const photoStores = stores.slice(0, 3);
  const colCount    = photoStores.length || 1;

  return (
    <div
      ref={cardRef}
      style={{
        position: 'fixed',
        left: -9999,
        top: 0,
        width: CARD_W,
        height: CARD_H,
        backgroundColor: BG,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", sans-serif',
      }}
      aria-hidden="true"
    >
      {/* ── Ambient top glow ────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 480,
          height: 340,
          background: 'radial-gradient(ellipse at center top, rgba(16,185,129,0.16) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Scan-line texture overlay (subtle horizontal stripes) ────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '40px 36px 0' }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: EMERALD_DIM,
          }}
        >
          ◎ Field Report
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.06em',
            color: 'rgba(255,255,255,0.18)',
          }}
        >
          {DOMAIN}
        </span>
      </div>

      {/* ── Hero: stamp count ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 48,
          paddingBottom: 8,
        }}
      >
        {/* Glow halo */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 160,
              height: 160,
              background: 'radial-gradient(circle, rgba(16,185,129,0.28) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
          <span
            style={{
              position: 'relative',
              fontSize: 104,
              fontWeight: 900,
              lineHeight: 1,
              color: EMERALD,
              textShadow: '0 0 60px rgba(16,185,129,0.6), 0 0 120px rgba(16,185,129,0.25)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {stamps}
          </span>
        </div>

        <p
          style={{
            marginTop: 10,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: WHITE_DIM,
          }}
        >
          {stamps === 1 ? 'Store Stamped' : 'Stores Stamped'}
        </p>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          margin: '28px 36px 0',
          borderRadius: 20,
          overflow: 'hidden',
          border: `1px solid ${EMERALD_BORDER}`,
          backgroundColor: EMERALD_FAINT,
        }}
      >
        {/* Distance */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 8px' }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: WHITE, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {fmtDistance(distanceKm)}
          </span>
          <span style={{ marginTop: 6, fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: WHITE_DIM }}>
            Walked
          </span>
        </div>

        <div style={{ width: 1, backgroundColor: EMERALD_BORDER }} />

        {/* Duration */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 8px' }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: WHITE, lineHeight: 1 }}>
            {fmtDuration(durationMinutes)}
          </span>
          <span style={{ marginTop: 6, fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: WHITE_DIM }}>
            Duration
          </span>
        </div>

        {neighborhood && (
          <>
            <div style={{ width: 1, backgroundColor: EMERALD_BORDER }} />
            {/* Neighborhood */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 8px', minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: WHITE, lineHeight: 1.2, textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {neighborhood}
              </span>
              <span style={{ marginTop: 6, fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: WHITE_DIM }}>
                Area
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Store photos strip ───────────────────────────────────────────── */}
      {photoStores.length > 0 && (
        <div style={{ margin: '32px 36px 0' }}>
          <p
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: EMERALD_DIM,
              marginBottom: 12,
            }}
          >
            Visited Today
          </p>

          {/* Photo grid */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              height: 200,
            }}
          >
            {photoStores.map((store) => (
              <div
                key={store.id}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  overflow: 'hidden',
                  backgroundColor: WHITE_FAINT,
                  position: 'relative',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {store.photos[0] ? (
                  <img
                    src={ikUrl(store.photos[0], 'card')}
                    alt={store.name}
                    crossOrigin="anonymous"
                    loading="eager"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(16,185,129,0.05)',
                    }}
                  >
                    <span style={{ fontSize: 24, color: EMERALD_DIM }}>◎</span>
                  </div>
                )}
                {/* Store name overlay at bottom */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px 10px 10px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)',
                  }}
                >
                  <p
                    style={{
                      fontSize: colCount === 1 ? 13 : 10,
                      fontWeight: 700,
                      color: WHITE,
                      lineHeight: 1.2,
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {store.name}
                  </p>
                  {store.neighborhood && (
                    <p
                      style={{
                        fontSize: 9,
                        color: 'rgba(255,255,255,0.5)',
                        margin: '2px 0 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {store.neighborhood}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Spacer ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1 }} />

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div
        style={{
          margin: '0 36px',
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${EMERALD_BORDER} 30%, ${EMERALD_BORDER} 70%, transparent 100%)`,
        }}
      />

      {/* ── Bottom branding ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 36px 44px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 900,
              fontStyle: 'italic',
              letterSpacing: '-0.01em',
              color: WHITE,
              textShadow: `0 0 20px ${CYAN}22`,
            }}
          >
            Lost in Transit
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '0.04em',
            }}
          >
            {DOMAIN}
          </span>
        </div>

        {/* Emerald dot ornament */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: `1.5px solid ${EMERALD_BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: EMERALD,
              boxShadow: `0 0 8px ${EMERALD}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
