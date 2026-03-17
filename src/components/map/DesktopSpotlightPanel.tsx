import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Shirt, UtensilsCrossed, Coffee, Home, Building2 } from 'lucide-react';
import { MAIN_CATEGORY_ICONS } from '../../lib/constants';
import { ikUrl } from '../../utils/ikUrl';
import type { Store } from '../../types/store';

interface DesktopSpotlightPanelProps {
  stores: Store[];
  onStoreSelect: (store: Store) => void;
  onDismiss: () => void;
}

function getCategoryIcon(mainCategory: string) {
  const iconName = MAIN_CATEGORY_ICONS[mainCategory as keyof typeof MAIN_CATEGORY_ICONS];
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Shirt, UtensilsCrossed, Coffee, Home, Building2,
  };
  return iconMap[iconName] ?? Shirt;
}

// Category accent colors matching the app's existing palette
const CATEGORY_COLORS: Record<string, string> = {
  Fashion:    '#22d9ee',
  Food:       '#FF6B35',
  Coffee:     '#c084fc',
  'Home Goods': '#FFD700',
  Museum:     '#9370DB',
  Spots:      '#10B981',
};

function StoreRow({ store, index, onSelect }: { store: Store; index: number; onSelect: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hasPhoto = store.photos && store.photos.length > 0;
  const Icon = getCategoryIcon(store.mainCategory || 'Fashion');
  const accentColor = CATEGORY_COLORS[store.mainCategory || 'Fashion'] ?? '#22d9ee';

  // Use ikUrl for ImageKit photos, raw url otherwise
  const photoSrc = hasPhoto ? ikUrl(store.photos[0], 'thumb') : '';

  return (
    <motion.button
      onClick={onSelect}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="w-full flex items-stretch gap-0 text-left focus:outline-none group"
      style={{
        backgroundColor: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'background-color 0.15s',
      }}
    >
      {/* Left accent stripe — color-coded by category */}
      <div
        className="w-0.5 shrink-0 self-stretch transition-opacity duration-150"
        style={{
          backgroundColor: accentColor,
          opacity: hovered ? 0.7 : 0,
        }}
      />

      <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
        {/* Thumbnail — 4:3 rectangular */}
        <div className="relative shrink-0 rounded-xl overflow-hidden bg-gray-800/80" style={{ width: 64, height: 48 }}>
          {hasPhoto ? (
            <>
              {!imgLoaded && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${photoSrc.replace('w-400', 'w-20')})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)',
                  }}
                />
              )}
              <img
                src={photoSrc}
                alt={store.name}
                loading="lazy"
                decoding="async"
                onLoad={() => setImgLoaded(true)}
                className="w-full h-full object-cover"
                style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>
          )}

          {/* Number badge */}
          <div
            className="absolute top-1 left-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #22D9EE 0%, #3B82F6 100%)',
              boxShadow: '0 0 6px rgba(34,217,238,0.6)',
            }}
          >
            <span className="text-white font-black leading-none" style={{ fontSize: 8 }}>{index + 1}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate leading-tight transition-colors duration-150"
            style={{ color: hovered ? '#fff' : 'rgba(255,255,255,0.88)' }}
          >
            {store.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {/* Category pill */}
            <span
              className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${accentColor}18`,
                color: accentColor,
                border: `1px solid ${accentColor}30`,
              }}
            >
              {store.mainCategory || 'Fashion'}
            </span>
            {store.neighborhood && (
              <span className="text-[10px] text-gray-600 truncate">{store.neighborhood}</span>
            )}
          </div>
        </div>

        {/* Animated arrow */}
        <motion.div
          animate={{ x: hovered ? 3 : 0, opacity: hovered ? 1 : 0.3 }}
          transition={{ duration: 0.15 }}
          className="shrink-0"
          style={{ color: accentColor }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </div>
    </motion.button>
  );
}

export function DesktopSpotlightPanel({ stores, onStoreSelect, onDismiss }: DesktopSpotlightPanelProps) {
  return (
    <AnimatePresence>
      {stores.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 24, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 24, scale: 0.98 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          // top-28 = 112px — clears the 64px nav + scrolling banner + breathing room
          className="absolute right-5 top-28 z-30 w-[280px]"
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: 'rgba(8, 8, 12, 0.97)',
              backdropFilter: 'blur(28px)',
              border: '1px solid rgba(34, 217, 238, 0.14)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.7), 0 0 32px rgba(34,217,238,0.06)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: '#22d9ee', boxShadow: '0 0 8px rgba(34,217,238,0.9)' }}
                />
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[13px] font-bold text-white tracking-tight">Nearby picks</span>
                <span
                  className="text-[10px] font-black px-1.5 py-0.5 rounded-full ml-0.5"
                  style={{ backgroundColor: 'rgba(34,217,238,0.12)', color: '#22d9ee' }}
                >
                  {stores.length}
                </span>
              </div>
              <button
                onClick={onDismiss}
                className="p-1.5 rounded-lg transition-colors text-gray-600 hover:text-white hover:bg-white/8"
                aria-label="Close recommendations"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Store rows */}
            <div>
              {stores.map((store, index) => (
                <div key={store.id} style={{ borderBottom: index < stores.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <StoreRow
                    store={store}
                    index={index}
                    onSelect={() => onStoreSelect(store)}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
