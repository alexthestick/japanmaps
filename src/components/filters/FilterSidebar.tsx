import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MAIN_CATEGORIES, FASHION_SUB_CATEGORIES, FOOD_SUB_CATEGORIES, HOME_GOODS_SUB_CATEGORIES, MAJOR_CITIES_JAPAN, LOCATIONS } from '../../lib/constants';
import { MapStyleToggle } from '../map/MapStyleToggle';
import type { MainCategory } from '../../types/store';

interface FilterSidebarProps {
  selectedMainCategory: MainCategory | null;
  selectedSubCategories: string[];
  selectedCity: string | null;
  selectedNeighborhood: string | null;
  onMainCategoryChange: (category: MainCategory | null) => void;
  onSubCategoryToggle: (category: string) => void;
  onCityChange: (city: string | null) => void;
  onNeighborhoodChange: (neighborhood: string | null) => void;
  onClearAll: () => void;
}

export function FilterSidebar({
  selectedMainCategory,
  selectedSubCategories,
  selectedCity,
  selectedNeighborhood,
  onMainCategoryChange,
  onSubCategoryToggle,
  onCityChange,
  onNeighborhoodChange,
  onClearAll,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // PHASE 1.5F-3: Theme toggle state for mobile sidebar
  const [styleMode, setStyleMode] = useState<'day' | 'night'>(() => {
    if (typeof window === 'undefined') return 'day';
    try {
      return (localStorage.getItem('map-style-mode') as 'day' | 'night') || 'day';
    } catch {
      return 'day';
    }
  });

  // PHASE 1.5F-3: Persist theme changes and broadcast to map
  useEffect(() => {
    try {
      localStorage.setItem('map-style-mode', styleMode);
      window.dispatchEvent(new CustomEvent('mapStyleModeChanged', { detail: styleMode }));
    } catch {}
  }, [styleMode]);

  const hasActiveFilters = selectedMainCategory || selectedSubCategories.length > 0 || selectedCity || selectedNeighborhood;

  return (
    <>
      {/* Mobile: Collapsible Sidebar */}
      <div className="md:hidden">
        {/* Mobile Backdrop */}
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-30 z-30 transition-opacity"
          />
        )}

        {/* Mobile Sidebar Panel */}
        <div
          className={`
            fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-40
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            overflow-y-auto
          `}
        >
          {/* Mobile Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            {/* PHASE 1.5F-3: Theme toggle in mobile sidebar */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium text-gray-700">Map Theme</span>
              <MapStyleToggle mode={styleMode} onChange={setStyleMode} placement="inline" compact />
            </div>
          </div>

          {/* Mobile Filter Content */}
          <div className="p-6 space-y-6">
            {renderFilterContent()}
          </div>
        </div>
      </div>

      {/* Desktop: Always-Visible Sidebar (SSENSE style) */}
      <div className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-20">
        <div className="px-6 py-6 space-y-6">
          {renderFilterContent()}
        </div>
      </div>
    </>
  );

  function renderFilterContent() {
    return (
      <>
        {/* Main Category */}
        <div>
          <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Category</h3>
          <div className="space-y-1">
            <button
              onClick={() => onMainCategoryChange(null)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                !selectedMainCategory
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>

            {MAIN_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => onMainCategoryChange(category)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  selectedMainCategory === category
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Fashion Sub-Categories */}
        {selectedMainCategory === 'Fashion' && (
          <div className="animate-fadeIn">
            <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Styles</h3>
            <div className="space-y-1">
              {FASHION_SUB_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => onSubCategoryToggle(category)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors capitalize ${
                    selectedSubCategories.includes(category)
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Food Sub-Categories */}
        {selectedMainCategory === 'Food' && (
          <div className="animate-fadeIn">
            <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Food Categories</h3>
            <div className="space-y-1">
              {FOOD_SUB_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => onSubCategoryToggle(category)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors capitalize ${
                    selectedSubCategories.includes(category)
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Home Goods Sub-Categories */}
        {selectedMainCategory === 'Home Goods' && (
          <div className="animate-fadeIn">
            <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Home Goods</h3>
            <div className="space-y-1">
              {HOME_GOODS_SUB_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => onSubCategoryToggle(category)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors capitalize ${
                    selectedSubCategories.includes(category)
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* City Filter */}
        <div>
          <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">City</h3>
          <select
            value={selectedCity || ''}
            onChange={(e) => onCityChange(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-900 transition-colors"
          >
            <option value="">All Cities</option>
            {MAJOR_CITIES_JAPAN.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Neighborhood Filter */}
        {selectedCity && LOCATIONS[selectedCity as keyof typeof LOCATIONS] && (
          <div className="animate-fadeIn">
            <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Neighborhood</h3>
            <select
              value={selectedNeighborhood || ''}
              onChange={(e) => onNeighborhoodChange(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-900 transition-colors"
            >
              <option value="">All Neighborhoods</option>
              {LOCATIONS[selectedCity as keyof typeof LOCATIONS].map((neighborhood) => (
                <option key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="w-full px-3 py-2.5 text-sm font-medium text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
        )}
      </>
    );
  }
}
