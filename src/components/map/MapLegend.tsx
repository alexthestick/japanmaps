import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MAIN_CATEGORY_COLORS, FASHION_COLORS, HOME_GOODS_COLORS, MAIN_CATEGORY_ICONS } from '../../lib/constants';

interface MapLegendProps {
  activeMainCategory?: string | null;
  activeSubCategory?: string | null;
}

export function MapLegend({ activeMainCategory, activeSubCategory }: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Determine what to show in legend
  const showMainCategories = !activeSubCategory;
  const showFashionSubCategories = activeMainCategory === 'Fashion' || activeSubCategory;
  const showHomeGoodsSubCategories = activeMainCategory === 'Home Goods';

  return (
    <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-w-xs">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        <span className="font-semibold text-gray-900">Map Legend</span>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 space-y-3">
          {/* Main Categories */}
          {showMainCategories && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Main Categories
              </p>
              <div className="space-y-1.5">
                {Object.entries(MAIN_CATEGORY_COLORS).map(([category, color]) => (
                  <div key={category} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm flex items-center gap-1.5">
                      <span>{MAIN_CATEGORY_ICONS[category as keyof typeof MAIN_CATEGORY_ICONS]}</span>
                      <span className="text-gray-700">{category}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fashion Sub-Categories */}
          {showFashionSubCategories && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                {activeSubCategory ? 'Active Filter' : 'Fashion Styles'}
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {Object.entries(FASHION_COLORS).map(([category, color]) => (
                  <div key={category} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-gray-700 capitalize">{category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Home Goods Sub-Categories */}
          {showHomeGoodsSubCategories && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Home Goods
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {Object.entries(HOME_GOODS_COLORS).map(([category, color]) => (
                  <div key={category} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-gray-700 capitalize">{category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info text */}
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {activeSubCategory
                ? 'Showing stores matching your filter'
                : 'Pin color shows main category or style'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
