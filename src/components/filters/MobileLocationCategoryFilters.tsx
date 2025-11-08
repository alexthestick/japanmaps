import { useState } from 'react';
import { MapPin, X, Shirt, UtensilsCrossed, Coffee, Home, Building2, ChevronDown } from 'lucide-react';
import type { MainCategory } from '../../types/store';

interface MobileLocationCategoryFiltersProps {
  // Location data
  cities: string[];
  neighborhoods: string[];
  currentCity: string | null;
  currentNeighborhood: string | null;

  // Category data
  selectedCategory: MainCategory | null;

  // Handlers
  onCityChange: (city: string) => void;
  onNeighborhoodChange: (neighborhood: string | null) => void;
  onCategoryChange: (category: MainCategory | null) => void;

  // Styling
  cityColor: string;
}

const MAIN_CATEGORIES = [
  { id: 'Fashion' as MainCategory, label: 'Fashion', icon: Shirt },
  { id: 'Food' as MainCategory, label: 'Food', icon: UtensilsCrossed },
  { id: 'Coffee' as MainCategory, label: 'Coffee', icon: Coffee },
  { id: 'Home Goods' as MainCategory, label: 'Home Goods', icon: Home },
  { id: 'Museum' as MainCategory, label: 'Museum', icon: Building2 },
];

export function MobileLocationCategoryFilters({
  cities,
  neighborhoods,
  currentCity,
  currentNeighborhood,
  selectedCategory,
  onCityChange,
  onNeighborhoodChange,
  onCategoryChange,
  cityColor,
}: MobileLocationCategoryFiltersProps) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Display text for location button
  const locationDisplayText = currentNeighborhood
    ? currentNeighborhood
    : currentCity || 'Select Location';

  return (
    <div className="md:hidden px-4 py-6 space-y-4 bg-gradient-to-b from-black via-gray-900 to-black relative">
      {/* Film grain */}
      <div className="absolute inset-0 film-grain opacity-20 pointer-events-none" />

      {/* Location Filter - Modal Trigger Button */}
      <div className="relative">
        <h3 className="text-xs font-black uppercase tracking-widest text-cyan-300/80 mb-2 italic ml-1"
            style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
          LOCATION
        </h3>

        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="w-full px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-200 flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${cityColor}30, ${cityColor}15)`,
            border: `2px solid ${cityColor}80`,
            color: '#fff',
            boxShadow: `0 0 20px ${cityColor}40`,
            textShadow: `0 0 10px ${cityColor}80`,
          }}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{locationDisplayText}</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter - Horizontal Pills */}
      <div className="relative">
        <h3 className="text-xs font-black uppercase tracking-widest text-purple-300/80 mb-2 italic ml-1"
            style={{ textShadow: '0 0 10px rgba(168, 85, 247, 0.3)' }}>
          CATEGORY
        </h3>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {/* All Categories */}
          <button
            onClick={() => onCategoryChange(null)}
            className="flex-shrink-0 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wide transition-all duration-200"
            style={{
              background: !selectedCategory
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(168, 85, 247, 0.2))'
                : 'rgba(0,0,0,0.4)',
              border: !selectedCategory
                ? '2px solid rgba(168, 85, 247, 0.8)'
                : '2px solid rgba(255,255,255,0.1)',
              color: !selectedCategory ? '#fff' : 'rgba(255,255,255,0.6)',
              boxShadow: !selectedCategory
                ? '0 0 20px rgba(168, 85, 247, 0.6), 0 0 10px rgba(168, 85, 247, 0.4)'
                : 'none',
              textShadow: !selectedCategory ? '0 0 10px rgba(168, 85, 247, 0.8)' : 'none',
            }}
          >
            All
          </button>

          {/* Individual Categories */}
          {MAIN_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(isActive ? null : cat.id)}
                className="flex-shrink-0 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wide transition-all duration-200 flex items-center gap-2"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(168, 85, 247, 0.2))'
                    : 'rgba(0,0,0,0.4)',
                  border: isActive
                    ? '2px solid rgba(168, 85, 247, 0.8)'
                    : '2px solid rgba(255,255,255,0.1)',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                  boxShadow: isActive
                    ? '0 0 20px rgba(168, 85, 247, 0.6), 0 0 10px rgba(168, 85, 247, 0.4)'
                    : 'none',
                  textShadow: isActive ? '0 0 10px rgba(168, 85, 247, 0.8)' : 'none',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
             onClick={() => setIsLocationModalOpen(false)}>
          <div
            className="w-full max-h-[80vh] bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-t-3xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Film grain */}
            <div className="absolute inset-0 film-grain opacity-20 pointer-events-none" />

            {/* Header */}
            <div className="relative px-6 py-4 border-b-2 border-cyan-400/30 flex items-center justify-between">
              <h3 className="text-xl font-black text-white uppercase tracking-wide italic"
                  style={{ textShadow: '0 0 15px rgba(34, 217, 238, 0.5)' }}>
                Select Location
              </h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 hover:bg-cyan-500/30 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="relative overflow-y-auto max-h-[calc(80vh-80px)] px-6 py-4">
              {/* Back to City (only if viewing neighborhood) */}
              {currentNeighborhood && currentCity && (
                <div className="mb-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-cyan-300/60 mb-2 ml-1">
                    Current City
                  </h4>
                  <button
                    onClick={() => {
                      onNeighborhoodChange(null);
                      setIsLocationModalOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-200 flex items-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${cityColor}40, ${cityColor}20)`,
                      border: `2px solid ${cityColor}`,
                      color: '#fff',
                      boxShadow: `0 0 20px ${cityColor}60, 0 0 10px ${cityColor}40`,
                      textShadow: `0 0 10px ${cityColor}80`,
                    }}
                  >
                    <MapPin className="w-4 h-4" />
                    ← Back to {currentCity}
                  </button>
                </div>
              )}

              {/* Neighborhoods (if any and viewing a city) */}
              {neighborhoods.length > 0 && currentCity && (
                <div className="mb-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-cyan-300/60 mb-2 ml-1">
                    Neighborhoods in {currentCity}
                  </h4>
                  <div className="space-y-2">
                    {neighborhoods.map((neighborhood) => {
                      const isActive = neighborhood === currentNeighborhood;
                      return (
                        <button
                          key={neighborhood}
                          onClick={() => {
                            onNeighborhoodChange(neighborhood);
                            setIsLocationModalOpen(false);
                          }}
                          className="w-full px-4 py-3 rounded-xl font-medium text-sm tracking-wide transition-all duration-200 text-left"
                          style={{
                            background: isActive
                              ? `linear-gradient(135deg, ${cityColor}30, ${cityColor}15)`
                              : 'rgba(0,0,0,0.4)',
                            border: isActive
                              ? `2px solid ${cityColor}80`
                              : '2px solid rgba(255,255,255,0.1)',
                            color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                            boxShadow: isActive
                              ? `0 0 15px ${cityColor}40`
                              : 'none',
                          }}
                        >
                          {neighborhood}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Cities */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-purple-300/60 mb-2 ml-1">
                  All Cities
                </h4>
                <div className="space-y-2">
                  {cities.map((city) => {
                    const isActive = city === currentCity && !currentNeighborhood;
                    return (
                      <button
                        key={city}
                        onClick={() => {
                          onCityChange(city);
                          setIsLocationModalOpen(false);
                        }}
                        className="w-full px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-200 text-left"
                        style={{
                          background: isActive
                            ? `linear-gradient(135deg, ${cityColor}40, ${cityColor}20)`
                            : 'rgba(0,0,0,0.4)',
                          border: isActive
                            ? `2px solid ${cityColor}`
                            : '2px solid rgba(255,255,255,0.1)',
                          color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                          boxShadow: isActive
                            ? `0 0 20px ${cityColor}60, 0 0 10px ${cityColor}40`
                            : 'none',
                          textShadow: isActive ? `0 0 10px ${cityColor}80` : 'none',
                        }}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
