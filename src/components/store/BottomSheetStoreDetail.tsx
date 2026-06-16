/**
 * BottomSheetStoreDetail — Framer Motion rewrite
 *
 * Replaces the react-spring-bottom-sheet version which crashed on React 18
 * due to an incompatible .getValue() internal API call.
 *
 * Behaviour preserved from the original:
 *  - Slides up from bottom
 *  - Hero image, action buttons, gallery, metadata all intact
 *  - Tap backdrop → close
 *  - Non-blocking: backdrop is semi-transparent and the close action is instant
 *
 * Simplification vs original:
 *  - No snap points (was: peek/half/full). Sheet opens at 65dvh and scrolls internally.
 *    Snap points can be added later as an enhancement once the core is stable.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MapPin, ExternalLink, Instagram, Clock, Navigation, X, Heart, ArrowUpRight, CheckCircle2, BookOpen } from 'lucide-react';
import type { Store } from '../../types/store';
import { getGoogleMapsUrl } from '../../utils/formatters';
import { saveStore, unsaveStore, isStoreSaved } from '../../utils/savedStores';
import { useNavigate } from 'react-router-dom';
import { ikUrl } from '../../utils/ikUrl';
import { BlurImage } from '../common/BlurImage';
import { KurbInventory } from './KurbInventory';
import { PostStampHaulPrompt } from '../radar/PostStampHaulPrompt';

interface BottomSheetStoreDetailProps {
  store: Store | null;
  onClose: () => void;
  isStamped?: boolean;
  isExploreMode?: boolean;
}

export function BottomSheetStoreDetail({ store, onClose, isStamped, isExploreMode = false }: BottomSheetStoreDetailProps) {
  const [isSaved, setIsSaved] = useState(store ? isStoreSaved(store.id) : false);
  const [showLogFind, setShowLogFind] = useState(false);
  const navigate = useNavigate();

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!store) return;
    if (isSaved) {
      unsaveStore(store.id);
      setIsSaved(false);
    } else {
      saveStore(store.id);
      setIsSaved(true);
    }
  };

  const storeUrl = store ? `/store/${store.slug || store.id}` : '/';

  return (
    <AnimatePresence>
      {store && (
        <>
          {/* Backdrop — tapping it closes the sheet */}
          <motion.div
            key="bssd-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[200]"
          />

          {/* Sheet */}
          <motion.div
            key="bssd-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-[201] bg-gray-900 rounded-t-3xl overflow-hidden"
            style={{ maxHeight: '65dvh' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-600 rounded-full" />
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(65dvh - 20px)' }}>

              {/* Hero image */}
              {store.photos[0] && (
                <div className="relative w-full h-[220px] bg-gray-800">
                  <BlurImage
                    src={ikUrl(store.photos[0], 'card')}
                    alt={store.name}
                    loading="eager"
                    imgClassName="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50" />

                  {/* Store name + stamped badge (stacked vertically, no overlap) */}
                  <div className="absolute top-4 left-4 right-32 z-10">
                    {/* Stamped badge sits above the name when present */}
                    {isStamped && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md mb-1.5"
                        style={{ backgroundColor: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.45)' }}>
                        <CheckCircle2 className="w-3 h-3" style={{ color: '#10b981' }} />
                        <span className="text-[11px] font-bold" style={{ color: '#10b981' }}>Stamped</span>
                      </div>
                    )}
                    <h1
                      className="text-lg font-bold text-white tracking-tight italic leading-tight line-clamp-2"
                      style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
                    >
                      {store.name}
                    </h1>
                    {store.nameJapanese && (
                      <p className="text-xs text-gray-300 mt-0.5" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
                        {store.nameJapanese}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                      onClick={handleSaveToggle}
                      className="p-2.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition-all active:scale-95"
                      aria-label={isSaved ? 'Unsave store' : 'Save store'}
                    >
                      <Heart className={`w-5 h-5 ${isSaved ? 'fill-cyan-400 text-cyan-400' : 'text-white'}`} />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition-all active:scale-95"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Category pills + save count */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div className="flex flex-wrap gap-2">
                      {store.categories.slice(0, 3).map((cat) => (
                        <span
                          key={cat}
                          className="px-3 py-1.5 rounded-full bg-cyan-400/20 backdrop-blur-sm border border-cyan-400/40 text-cyan-300 font-medium text-xs italic"
                        >
                          {cat}
                        </span>
                      ))}
                      {store.verified && (
                        <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-cyan-500/25 backdrop-blur-sm border border-cyan-400/50 text-white font-bold text-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    {store.saveCount > 0 && (
                      <div className="flex items-center gap-1 px-2.5 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-cyan-400/30">
                        <Heart className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                        <span className="text-xs font-bold text-cyan-300">{store.saveCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Store info */}
              <div className="px-5 py-5 space-y-4">

                {(store.address || store.city || store.neighborhood) && (
                  <div className="flex gap-3 items-start">
                    <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5 flex-1">
                      {store.address && (
                        <p className="text-sm text-gray-200 leading-relaxed">{store.address}</p>
                      )}
                      <p className="text-sm text-gray-400">
                        {[store.neighborhood, store.city].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {store.hours && (
                  <div className="flex gap-3 items-start">
                    <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">{store.hours}</p>
                  </div>
                )}

                {store.description && (
                  <div className="pt-1">
                    <p className="text-sm text-gray-300 leading-relaxed">{store.description}</p>
                  </div>
                )}

                {/* Kurb inventory — sits between description and photos so it's visible without extra scrolling */}
                {store.kurb_vendor_id != null && (
                  <KurbInventory
                    vendorId={store.kurb_vendor_id}
                    compact
                    accentColor={
                      store.mainCategory
                        ? ({ Fashion: '#22D9EE', Food: '#f97316', Coffee: '#d97706', Museum: '#8b5cf6', 'Home Goods': '#10b981', Spots: '#ec4899' } as Record<string, string>)[store.mainCategory] ?? '#22D9EE'
                        : '#22D9EE'
                    }
                  />
                )}

                {/* Photo gallery */}
                {store.photos.length > 1 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-base font-bold text-cyan-400 italic">More Photos</h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      {store.photos.slice(1, 5).map((photo, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-800">
                          <BlurImage
                            src={ikUrl(photo, 'thumb')}
                            alt={`${store.name} photo ${idx + 2}`}
                            imgClassName="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={() => navigate(storeUrl, { state: { from: 'map' } })}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg"
                  >
                    <ArrowUpRight className="w-5 h-5" />
                    Open Store
                  </button>

                  {/* Log a Find — only in explore/radar mode after stamping */}
                  {isExploreMode && isStamped && (
                    <button
                      onClick={() => setShowLogFind(true)}
                      className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl font-bold border active:scale-95 transition-all"
                      style={{
                        background: 'rgba(139,92,246,0.15)',
                        borderColor: 'rgba(139,92,246,0.45)',
                        color: '#c4b5fd',
                      }}
                    >
                      <BookOpen className="w-5 h-5" />
                      Log a Find
                    </button>
                  )}

                  <a
                    href={getGoogleMapsUrl(store.latitude, store.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gray-800 text-cyan-300 font-bold rounded-xl border border-cyan-400/40 hover:bg-cyan-500/20 active:scale-95 transition-all"
                  >
                    <Navigation className="w-5 h-5" />
                    Get Directions
                  </a>

                  {(store.instagram || store.website) && (
                    <div className="grid grid-cols-2 gap-3">
                      {store.instagram && (
                        <a
                          href={`https://instagram.com/${store.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-500/20 text-pink-300 font-semibold text-sm rounded-lg border border-pink-400/30 hover:bg-pink-500/30 active:scale-95 transition-all"
                        >
                          <Instagram className="w-4 h-4" />
                          Instagram
                        </a>
                      )}
                      {store.website && (
                        <a
                          href={store.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700/50 text-gray-200 font-semibold text-sm rounded-lg border border-gray-600/50 hover:bg-gray-700 active:scale-95 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Website
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Log a Find prompt — overlays the sheet when open */}
                {showLogFind && (
                  <PostStampHaulPrompt
                    store={store}
                    onClose={() => setShowLogFind(false)}
                  />
                )}

                {/* Safe area spacer */}
                <div style={{ height: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
