import { useState } from 'react';
import { ChevronDown, Shirt, UtensilsCrossed, Coffee, Home, Building2, MapPin, LucideIcon } from 'lucide-react';
import { MAIN_CATEGORY_COLORS, MAIN_CATEGORY_ICONS } from '../../lib/constants';
import type { MainCategory } from '../../types/store';

interface FloatingMapLegendProps {
  selectedCategory?: MainCategory | null;
  onCategoryClick?: (category: MainCategory | null) => void;
}

export function FloatingMapLegend({ selectedCategory, onCategoryClick }: FloatingMapLegendProps) {
  const [isOpen, setIsOpen] = useState(true);

  const getIconComponent = (iconName: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      'Shirt': Shirt,
      'UtensilsCrossed': UtensilsCrossed,
      'Coffee': Coffee,
      'Home': Home,
      'Building2': Building2,
      'MapPin': MapPin,
    };
    return iconMap[iconName] || Shirt;
  };

  return (
    <div className="absolute bottom-6 left-6 z-20">
      {/* Kirby-themed Map Legend with enhanced neon glow */}
      <div className="relative">
        {/* Animated glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-xl opacity-40 blur-md animate-pulse"></div>

        {/* Main card - Increased opacity for better readability on light maps */}
        <div className="relative bg-gradient-to-b from-gray-950 to-black backdrop-blur-xl rounded-xl shadow-2xl border-2 border-cyan-400/50 p-4 min-w-[220px]">
          {/* Film grain */}
          <div className="absolute inset-0 film-grain opacity-15 pointer-events-none rounded-xl" />

          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan-400/70 rounded-tl-lg"></div>
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-purple-400/70 rounded-br-lg"></div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full mb-3 relative z-10"
          >
            <h3 className="font-black text-sm uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 italic" style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.4)' }}>
              Map Legend
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-cyan-400 transition-transform ${isOpen ? '' : 'rotate-180'}`}
            />
          </button>

          {isOpen && (
            <div className="space-y-2 text-sm relative z-10">
              {Object.entries(MAIN_CATEGORY_COLORS).map(([category, color]) => {
                const iconName = MAIN_CATEGORY_ICONS[category as keyof typeof MAIN_CATEGORY_ICONS];
                const IconComponent = getIconComponent(iconName);
                const isSelected = selectedCategory === category;

                return (
                  <button
                    key={category}
                    onClick={() => onCategoryClick?.(isSelected ? null : category as MainCategory)}
                    className={`w-full flex items-center gap-3 group cursor-pointer p-2 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50'
                        : 'hover:bg-gray-800/50'
                    }`}
                    style={isSelected ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
                  >
                    {/* Pin-style circle */}
                    <div
                      className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-lg flex-shrink-0"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 2px 6px rgba(0,0,0,0.3)`,
                        border: '2px solid white',
                      }}
                    >
                      <IconComponent size={14} color="white" strokeWidth={2.5} />
                    </div>
                    <span className={`text-sm font-bold transition-colors ${
                      isSelected ? 'text-cyan-300' : 'text-white group-hover:text-cyan-200'
                    }`}>
                      {category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
