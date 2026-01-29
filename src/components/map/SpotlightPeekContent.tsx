import { X, ChevronRight } from 'lucide-react';
import { MAIN_CATEGORY_ICONS } from '../../lib/constants';
import type { Store } from '../../types/store';
import { Shirt, UtensilsCrossed, Coffee, Home, Building2 } from 'lucide-react';

interface SpotlightPeekContentProps {
  stores: Store[];
  onStoreSelect: (store: Store) => void;
  onDismiss: () => void;
}

/**
 * PHASE 3 REDESIGN: Spotlight Peek Content
 * Beautiful horizontal carousel of spotlighted stores
 * Lives inside bottom sheet peek state
 */
export function SpotlightPeekContent({ stores, onStoreSelect, onDismiss }: SpotlightPeekContentProps) {
  const getIcon = (mainCategory: string) => {
    const iconName = MAIN_CATEGORY_ICONS[mainCategory];
    const iconMap: Record<string, any> = {
      'Shirt': Shirt,
      'UtensilsCrossed': UtensilsCrossed,
      'Coffee': Coffee,
      'Home': Home,
      'Building2': Building2,
    };
    const Icon = iconMap[iconName] || Shirt;
    return Icon;
  };

  return (
    <div className="bg-gray-900 pb-4">
      {/* Header with title and dismiss */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"
            style={{ boxShadow: '0 0 8px rgba(34, 217, 238, 0.6)' }}
          />
          <h3 className="text-base font-bold text-white italic">
            5 Recommended Stores
          </h3>
        </div>
        <button
          onClick={onDismiss}
          className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors active:scale-95"
          aria-label="Close recommendations"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-cyan-300" />
        </button>
      </div>

      {/* Horizontal scrollable cards */}
      <div
        className="overflow-x-auto scrollbar-hide px-5"
        style={{
          touchAction: 'pan-x', // CRITICAL: Only allow horizontal scrolling on touch devices
          overscrollBehavior: 'contain', // Prevent scroll chaining to parent
          WebkitOverflowScrolling: 'touch', // Smooth momentum scrolling on iOS
          scrollBehavior: 'smooth', // Smooth scrolling
          cursor: 'grab',
        }}
      >
        <div className="flex gap-3 pb-2" style={{ minWidth: 'min-content' }}>
          {stores.map((store, index) => {
            const Icon = getIcon(store.mainCategory || 'Fashion');
            const hasPhoto = store.photos && store.photos.length > 0;

            return (
              <button
                key={store.id}
                onClick={() => onStoreSelect(store)}
                className="flex-shrink-0 w-[160px] group active:scale-95 transition-transform duration-200"
              >
                {/* Card container with gradient border effect */}
                <div className="relative">
                  {/* Glow effect on hover/active */}
                  <div
                    className="absolute -inset-0.5 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-active:opacity-50 transition-opacity duration-200 blur-sm"
                  />

                  {/* Main card */}
                  <div className="relative bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 group-hover:border-cyan-400/50 transition-all">
                    {/* Photo or placeholder */}
                    <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900">
                      {hasPhoto ? (
                        <>
                          <img
                            src={store.photos[0]}
                            alt={store.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Gradient overlay for better text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        </>
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <Icon className="w-12 h-12 text-gray-600" />
                        </div>
                      )}

                      {/* Number badge - top left */}
                      <div
                        className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #22D9EE 0%, #3B82F6 100%)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), 0 0 12px rgba(34, 217, 238, 0.6)',
                        }}
                      >
                        <span className="text-white font-black text-xs">
                          {index + 1}
                        </span>
                      </div>

                      {/* Store info overlay - bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-2.5">
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold text-xs leading-tight line-clamp-2 mb-0.5">
                              {store.name}
                            </h4>
                            {store.neighborhood && (
                              <p className="text-gray-300 text-[10px] truncate">
                                {store.neighborhood}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Category pill */}
                    <div className="px-2.5 py-1.5 flex items-center justify-center gap-1.5 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50">
                      <Icon className="w-3 h-3 text-cyan-400" />
                      <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wide">
                        {store.mainCategory || 'Fashion'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtle instruction hint */}
      <div className="text-center mt-2 px-5">
        <p className="text-xs text-gray-500 italic">
          Tap a card to view details
        </p>
      </div>
    </div>
  );
}
