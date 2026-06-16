/**
 * KurbLightbox
 *
 * Full-screen image preview for a single Kurb item.
 * Opens when the user taps any item card in KurbInventory or KurbStrip.
 *
 * Layout:
 *  - Dark scrim backdrop (closes on tap)
 *  - Image fills top portion (aspect-[3/4] max)
 *  - Brand / title / size+condition / price below
 *  - "Shop on KURB →" CTA at bottom
 *  - X button top-right
 *
 * Framer Motion: slides up + fades in. Exit reverses.
 */

import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ExternalLink } from 'lucide-react';

export interface KurbLightboxItem {
  imageUrl: string | null;
  title: string;
  brand: string;
  price: string;            // pre-formatted, e.g. "$42"
  size?: string | null;
  condition?: string | null;
  kurbUrl: string;
}

interface Props {
  item: KurbLightboxItem | null;
  accentColor?: string;
  onClose: () => void;
}

export function KurbLightbox({ item, accentColor = '#22D9EE', onClose }: Props) {
  return createPortal(
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            key="kurb-lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300]"
          />

          {/* Panel — slides up from bottom */}
          <motion.div
            key="kurb-lightbox-panel"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[301] bg-gray-900 rounded-t-3xl overflow-hidden"
            style={{ maxHeight: '88dvh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-700" />
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(88dvh - 28px)' }}>
              {/* Back button — always visible at top of scroll area */}
              <div className="flex items-center justify-between px-4 pb-3">
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-300 active:opacity-60 transition-opacity"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                  Back
                </button>
              </div>

              {/* Image — object-contain so full item always visible */}
              <div
                className="w-full bg-gray-900 flex items-center justify-center"
                style={{ maxHeight: '45vh', minHeight: 200 }}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full object-contain"
                    style={{ maxHeight: '45vh' }}
                  />
                ) : (
                  <ShoppingBag className="w-12 h-12 text-gray-700" />
                )}
              </div>

              {/* Details */}
              <div className="px-5 pt-5 pb-6 space-y-4">
                {/* Brand */}
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: accentColor, opacity: 0.85 }}
                >
                  {item.brand}
                </p>

                {/* Title */}
                <p className="text-white text-base font-semibold leading-snug">
                  {item.title}
                </p>

                {/* Meta row: condition + size */}
                {(item.condition || item.size) && (
                  <div className="flex items-center gap-2">
                    {item.condition && (
                      <span className="text-xs text-gray-300 px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700">
                        {item.condition}
                      </span>
                    )}
                    {item.size && (
                      <span className="text-xs text-gray-300 px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700">
                        {item.size}
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <p className="text-2xl font-black text-white">{item.price}</p>

                {/* CTA */}
                <a
                  href={item.kurbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition-all active:scale-[0.97]"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}0a)`,
                    border: `1.5px solid ${accentColor}50`,
                    color: accentColor,
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Shop on KURB
                </a>

                {/* Attribution */}
                <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest">
                  Powered by KURB
                </p>

                {/* Safe-area spacer */}
                <div style={{ height: 'env(safe-area-inset-bottom, 16px)' }} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
