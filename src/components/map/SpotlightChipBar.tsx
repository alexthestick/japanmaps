import { X } from 'lucide-react';
import { MAIN_CATEGORY_ICONS } from '../../lib/constants';
import type { Store } from '../../types/store';
import { Shirt, UtensilsCrossed, Coffee, Home, Building2 } from 'lucide-react';

interface SpotlightChipBarProps {
  stores: Store[];
  onStoreClick: (store: Store) => void;
  onDismiss: () => void;
}

/**
 * PHASE 3: Spotlight Chip Bar
 * Horizontal scrollable bar showing spotlighted stores
 * Mobile-only, fixed at bottom with safe-area inset
 */
export function SpotlightChipBar({ stores, onStoreClick, onDismiss }: SpotlightChipBarProps) {
  if (stores.length === 0) return null;

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
    return <Icon className="w-3.5 h-3.5" />;
  };

  return (
    <div
      className="fixed left-0 right-0 z-40 px-4 animate-in slide-in-from-bottom duration-300"
      style={{
        // Position above bottom sheet peek height + safe area
        bottom: 'max(6rem, calc(6rem + env(safe-area-inset-bottom, 0px)))',
      }}
    >
      {/* Container with cyberpunk glow */}
      <div className="max-w-7xl mx-auto">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-30 blur-md" />

          {/* Main bar */}
          <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl border-2 border-cyan-400/30 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5">
              {/* Dismiss button */}
              <button
                onClick={onDismiss}
                className="flex-shrink-0 p-2 hover:bg-gray-800 rounded-lg transition-colors active:scale-95"
                aria-label="Clear spotlight"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-cyan-300" />
              </button>

              {/* Scrollable chip container */}
              <div className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2">
                  {stores.map((store, index) => (
                    <button
                      key={store.id}
                      onClick={() => onStoreClick(store)}
                      className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/60 border border-cyan-400/30 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all active:scale-95"
                      style={{
                        boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)',
                      }}
                    >
                      {/* Number badge */}
                      <div
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #22D9EE 0%, #3B82F6 100%)',
                          boxShadow: '0 0 8px rgba(34, 217, 238, 0.4)',
                        }}
                      >
                        <span className="text-white font-black text-xs" style={{ fontSize: '10px' }}>
                          {index + 1}
                        </span>
                      </div>

                      {/* Category icon */}
                      <div className="text-cyan-300 flex-shrink-0">
                        {getIcon(store.mainCategory || 'Fashion')}
                      </div>

                      {/* Store name */}
                      <span className="text-sm font-semibold text-white whitespace-nowrap">
                        {store.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
