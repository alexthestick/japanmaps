import { VerticalCityList } from './VerticalCityList';
import { ShoppingBag, Utensils, Coffee, Home, Landmark } from 'lucide-react';
import type { MainCategory } from '../../types/store';

interface ListViewSidebarProps {
  selectedMainCategory: MainCategory | null;
  selectedCity: string | null;
  onMainCategoryChange: (category: MainCategory | null) => void;
  onCityChange: (city: string | null) => void;
  onClearAll: () => void;
}

const MAIN_CATEGORIES = [
  { id: 'Fashion' as MainCategory, label: 'Fashion', icon: ShoppingBag },
  { id: 'Food' as MainCategory, label: 'Food', icon: Utensils },
  { id: 'Coffee' as MainCategory, label: 'Coffee', icon: Coffee },
  { id: 'Home Goods' as MainCategory, label: 'Home Goods', icon: Home },
  { id: 'Museum' as MainCategory, label: 'Museum', icon: Landmark },
];

export function ListViewSidebar({
  selectedMainCategory,
  selectedCity,
  onMainCategoryChange,
  onCityChange,
  onClearAll,
}: ListViewSidebarProps) {
  const hasActiveFilters = selectedMainCategory || selectedCity;

  return (
    <aside className="w-60 bg-white border-r border-gray-200 p-6 overflow-y-auto h-[calc(100vh-64px)] sticky top-16">
      <div className="space-y-6">
        {/* Category Section */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
            CATEGORY
          </h3>
          <div className="space-y-1">
            {/* All Categories */}
            <button
              onClick={() => onMainCategoryChange(null)}
              className={`
                w-full text-left px-3 py-2 rounded text-sm font-medium transition-all
                ${!selectedMainCategory
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              All
            </button>

            {/* Individual categories */}
            {MAIN_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedMainCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => onMainCategoryChange(isSelected ? null : cat.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded text-sm font-medium transition-all flex items-center gap-2
                    ${isSelected
                      ? 'bg-gray-100 text-gray-900 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* City Section */}
        <div className="border-t pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
            CITY
          </h3>
          <VerticalCityList
            selectedCity={selectedCity}
            onCityChange={onCityChange}
          />
        </div>

        {/* Clear All */}
        {hasActiveFilters && (
          <div className="border-t pt-6">
            <button
              onClick={onClearAll}
              className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
