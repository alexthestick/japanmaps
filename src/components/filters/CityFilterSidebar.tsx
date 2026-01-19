import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FASHION_SUB_CATEGORIES, FOOD_SUB_CATEGORIES, HOME_GOODS_SUB_CATEGORIES } from '../../lib/constants';

// interface CategoryFilter {
//   mainCategory: string;
//   subcategories: string[];
// }

interface CityFilterSidebarProps {
  selectedFilters: {
    mainCategories: string[];
    subcategories: string[];
  };
  onFilterChange: (filters: {
    mainCategories: string[];
    subcategories: string[];
  }) => void;
}

const MAIN_CATEGORIES = ['Fashion', 'Food', 'Coffee', 'Home Goods', 'Museum', 'Spots'];
const CATEGORY_ICONS = {
  Fashion: '👔',
  Food: '🍜',
  Coffee: '☕',
  'Home Goods': '🏠',
  Museum: '🏛️',
  Spots: '📍',
};

// Subcategories for expandable categories - using actual constants from the system
const SUBCATEGORIES_MAP: Record<string, readonly string[]> = {
  Fashion: FASHION_SUB_CATEGORIES,
  Food: FOOD_SUB_CATEGORIES,
  'Home Goods': HOME_GOODS_SUB_CATEGORIES,
};

export function CityFilterSidebar({
  selectedFilters,
  onFilterChange,
}: CityFilterSidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleMainCategory = (category: string) => {
    const hasSubcategories = SUBCATEGORIES_MAP[category];

    const newMainCategories = selectedFilters.mainCategories.includes(category)
      ? selectedFilters.mainCategories.filter((c) => c !== category)
      : [...selectedFilters.mainCategories, category];

    onFilterChange({
      ...selectedFilters,
      mainCategories: newMainCategories,
    });

    // If category has subcategories, toggle its expanded state
    if (hasSubcategories) {
      setExpandedCategory(
        expandedCategory === category ? null : category
      );
    }
  };

  const toggleSubcategory = (subcategory: string) => {
    const newSubcategories = selectedFilters.subcategories.includes(subcategory)
      ? selectedFilters.subcategories.filter((s) => s !== subcategory)
      : [...selectedFilters.subcategories, subcategory];

    onFilterChange({
      ...selectedFilters,
      subcategories: newSubcategories,
    });
  };

  return (
    <aside className="w-60 bg-white border-r border-gray-200 p-6 overflow-y-auto max-h-screen sticky top-0">
      <div className="space-y-4">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Filter by Category</h2>
          <p className="text-sm text-gray-500">Select your preferences</p>
        </div>

        {/* Category Buttons (Vending Machine Style) */}
        <div className="space-y-3">
          {MAIN_CATEGORIES.map((category) => {
            const isSelected = selectedFilters.mainCategories.includes(category);
            const hasSubcategories = SUBCATEGORIES_MAP[category];

            return (
              <div key={category} className="space-y-2">
                {/* Main Category Button */}
                <button
                  onClick={() => toggleMainCategory(category)}
                  className={`
                    w-full px-4 py-3 rounded-lg font-semibold text-sm
                    transition-all duration-200
                    flex items-center justify-between
                    border-2
                    ${
                      isSelected
                        ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">
                      {CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}
                    </span>
                    {category}
                  </span>
                  {hasSubcategories && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedCategory === category ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {/* Subcategories */}
                {hasSubcategories && expandedCategory === category && (
                  <div className="space-y-2 ml-4 pl-4 border-l-2 border-gray-200">
                      {hasSubcategories.map((subcategory) => {
                        const isSubSelected =
                          selectedFilters.subcategories.includes(subcategory);

                        return (
                          <button
                            key={subcategory}
                            onClick={() => toggleSubcategory(subcategory)}
                            className={`
                              w-full px-3 py-2 rounded text-sm font-medium
                              transition-all duration-200
                              border
                              ${
                                isSubSelected
                                  ? 'border-gray-600 bg-gray-100 text-gray-900'
                                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                              }
                            `}
                          >
                            {subcategory}
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>
            );
          })}
        </div>

        {/* Clear All Button */}
        {selectedFilters.mainCategories.length > 0 ||
        selectedFilters.subcategories.length > 0 ? (
          <button
            onClick={() => {
              onFilterChange({
                mainCategories: [],
                subcategories: [],
              });
            }}
            className="w-full mt-6 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Clear Filters
          </button>
        ) : null}
      </div>
    </aside>
  );
}
