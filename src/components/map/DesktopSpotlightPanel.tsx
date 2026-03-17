import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import { Shirt, UtensilsCrossed, Coffee, Home, Building2 } from 'lucide-react';
import { MAIN_CATEGORY_ICONS } from '../../lib/constants';
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

export function DesktopSpotlightPanel({ stores, onStoreSelect, onDismiss }: DesktopSpotlightPanelProps) {
  return (
    <AnimatePresence>
      {stores.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 32, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 32, scale: 0.97 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="absolute right-5 top-20 z-30 w-72"
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="rounded-2xl overflow-hidden shadow-2xl border"
            style={{
              backgroundColor: 'rgba(10, 10, 15, 0.96)',
              backdropFilter: 'blur(24px)',
              borderColor: 'rgba(34, 217, 238, 0.18)',
              boxShadow: '0 0 40px rgba(34, 217, 238, 0.08), 0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"
                  style={{ boxShadow: '0 0 8px rgba(34, 217, 238, 0.8)' }}
                />
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-sm font-bold text-white italic">Recommended</span>
              </div>
              <button
                onClick={onDismiss}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-gray-500 hover:text-white"
                aria-label="Close recommendations"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Store list */}
            <div className="divide-y divide-white/5">
              {stores.map((store, index) => {
                const Icon = getCategoryIcon(store.mainCategory || 'Fashion');
                const hasPhoto = store.photos && store.photos.length > 0;

                return (
                  <button
                    key={store.id}
                    onClick={() => onStoreSelect(store)}
                    className="w-full flex items-center gap-3 px-4 py-3 group transition-colors hover:bg-white/5 text-left"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-800">
                      {hasPhoto ? (
                        <img
                          src={store.photos[0]}
                          alt={store.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                      {/* Number badge */}
                      <div
                        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #22D9EE 0%, #3B82F6 100%)',
                          boxShadow: '0 0 8px rgba(34,217,238,0.5)',
                        }}
                      >
                        <span className="text-white font-black" style={{ fontSize: 8 }}>{index + 1}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate leading-tight">{store.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">
                        {store.neighborhood ? `${store.neighborhood} · ` : ''}{store.mainCategory || 'Fashion'}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 shrink-0 transition-colors duration-150 group-hover:translate-x-0.5"
                      style={{ transition: 'transform 0.15s, color 0.15s' }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <p className="text-[11px] text-gray-600 text-center italic">Click a store to view details</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
