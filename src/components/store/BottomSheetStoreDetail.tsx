import { useState, useRef } from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import { MapPin, ExternalLink, Instagram, Clock, Navigation, X, Heart } from 'lucide-react';
import type { Store } from '../../types/store';
import { getGoogleMapsUrl } from '../../utils/formatters';
import { saveStore, unsaveStore, isStoreSaved } from '../../utils/savedStores';
import 'react-spring-bottom-sheet/dist/style.css';

interface BottomSheetStoreDetailProps {
  store: Store | null;
  onClose: () => void;
}

export function BottomSheetStoreDetail({ store, onClose }: BottomSheetStoreDetailProps) {
  const [isSaved, setIsSaved] = useState(store ? isStoreSaved(store.id) : false);
  const sheetRef = useRef<any>();

  if (!store) return null;

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      unsaveStore(store.id);
      setIsSaved(false);
    } else {
      saveStore(store);
      setIsSaved(true);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <BottomSheet
      open={!!store}
      onDismiss={onClose}
      ref={sheetRef}
      defaultSnap={({ maxHeight }) => maxHeight * 0.6}
      snapPoints={({ maxHeight }) => [
        maxHeight * 0.18, // Peek
        maxHeight * 0.6,  // Half (default)
        maxHeight * 0.9,  // Full
      ]}
      expandOnContentDrag={true}
      blocking={false}
      // FINAL: Prevent accidental dismissal - require strong swipe down
      sibling={
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 149 }}
        />
      }
      skipInitialTransition={false}
      header={
        // PHASE 2.1L: Minimal header with just drag handle
        <div className="w-full pt-2 pb-3 bg-gray-900">
          <div className="flex justify-center">
            <div className="w-10 h-1 bg-gray-600 rounded-full" />
          </div>
        </div>
      }
      className="bottom-sheet-custom"
    >
      {/* PHASE 2.1L: Redesigned Layout - No white gaps, clean flow */}
      <div className="bg-gray-900 min-h-full">
        {/* Hero Image with Overlay Info */}
        {store.photos[0] && (
          <div className="relative w-full h-[280px] bg-gray-800">
            <img
              src={store.photos[0]}
              alt={store.name}
              className="w-full h-full object-cover"
            />

            {/* Gradient overlays for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50" />

            {/* FINAL: Store Name - Top Left (visible in peek mode, with proper spacing) */}
            <div className="absolute top-4 left-4 right-32 z-10 pr-2">
              <h1 className="text-lg font-bold text-white tracking-tight italic leading-tight line-clamp-2"
                  style={{
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.9)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word'
                  }}>
                {store.name}
              </h1>
            </div>

            {/* Action Buttons - Top Right on Photo */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                onClick={handleSaveToggle}
                className="p-2.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition-all active:scale-95"
                aria-label={isSaved ? 'Unsave store' : 'Save store'}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-cyan-400 text-cyan-400' : 'text-white'}`} />
              </button>
              <button
                onClick={handleClose}
                className="p-2.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition-all active:scale-95"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Category Pills - Bottom of Photo */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex flex-wrap gap-2">
                {store.categories.slice(0, 3).map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1.5 rounded-full bg-cyan-400/20 backdrop-blur-sm border border-cyan-400/40 text-cyan-300 font-medium text-xs italic"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Section - Seamless dark background */}
        <div className="px-5 py-5 space-y-4 bg-gray-900">
          {/* Address */}
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

          {/* Hours */}
          {store.hours && (
            <div className="flex gap-3 items-start">
              <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">{store.hours}</p>
            </div>
          )}

          {/* Description */}
          {store.description && (
            <div className="pt-2">
              <p className="text-sm text-gray-300 leading-relaxed">
                {store.description}
              </p>
            </div>
          )}

          {/* Photo Gallery */}
          {store.photos.length > 1 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-cyan-400 italic">More Photos</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {store.photos.slice(1, 5).map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-800"
                  >
                    <img
                      src={photo}
                      alt={`${store.name} photo ${idx + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <a
              href={getGoogleMapsUrl(store.latitude, store.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-transform shadow-lg"
            >
              <Navigation className="w-5 h-5" />
              Get Directions
            </a>

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
          </div>

          {/* Bottom padding for safe area */}
          <div className="h-6" />
        </div>
      </div>
    </BottomSheet>
  );
}
