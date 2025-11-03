import { Search } from 'lucide-react';
import { FilterPill } from './FilterPill';
import type { MainCategory } from '../../types/store';

interface MobileFilterBarProps {
  // Category state
  selectedMainCategory: MainCategory | null;
  onMainCategoryChange: (category: MainCategory | null) => void;

  // Subcategory state
  selectedSubCategories: string[];
  onSubCategoryToggle: (category: string) => void;

  // City/neighborhood state
  selectedCity: string | null;
  selectedNeighborhood: string | null;
  onCityChange: (city: string | null) => void;

  // Search state
  searchQuery: string;
  onSearchChange: (query: string) => void;

  // Dropdown visibility
  onOpenCityDrawer: () => void;
}

/**
 * Mobile-only floating filter bar for map view
 * Floats over map like Google Maps with search bar + category pills
 */
export function MobileFilterBar({
  selectedMainCategory,
  onMainCategoryChange,
  selectedSubCategories,
  onSubCategoryToggle,
  selectedCity,
  selectedNeighborhood,
  searchQuery,
  onSearchChange,
  onOpenCityDrawer,
}: MobileFilterBarProps) {

  // Category mapping: Category name → Icons & subcategories
  const categoryMap: Record<string, { icon: string; subcategories?: string[] }> = {
    'Cities': { icon: '🏙️' },
    'Fashion': { icon: '👔', subcategories: ['Vintage', 'Thrift', 'Designer', 'Streetwear', 'Boutique'] },
    'Food': { icon: '🍜' },
    'Coffee': { icon: '☕' },
    'Home Goods': { icon: '🏠' },
    'Museum': { icon: '🏛️' },
  };

  // Order: Cities first, then actual main categories
  const categoryOrder = ['Cities', 'Fashion', 'Food', 'Coffee', 'Home Goods', 'Museum'];

  return (
    <div className="fixed top-20 left-0 right-0 z-30 px-4 pointer-events-none">
      <div className="max-w-7xl mx-auto space-y-2 pointer-events-auto">
        {/* Search Bar - Floating */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-30 blur-md" />
          <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl border-2 border-cyan-400/30 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search stores, neighborhoods..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-base"
              />
            </div>
          </div>
        </div>

        {/* Category Pills - Horizontal Scroll (Google Maps style) */}
        <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-2">
          {categoryOrder.map((categoryName) => {
            const { icon, subcategories } = categoryMap[categoryName];
            const isActive = categoryName === 'Cities'
              ? !!(selectedCity || selectedNeighborhood)
              : selectedMainCategory === categoryName;

            return (
              <FilterPill
                key={categoryName}
                label={`${icon} ${categoryName}`}
                active={isActive}
                hasDropdown={categoryName === 'Cities'}
                onClick={() => {
                  if (categoryName === 'Cities') {
                    onOpenCityDrawer();
                  } else {
                    onMainCategoryChange(categoryName as MainCategory);
                  }
                }}
              />
            );
          })}
        </div>

        {/* Subcategory Pills - Show when Fashion is selected */}
        {selectedMainCategory === 'Fashion' && categoryMap['Fashion'].subcategories && (
          <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-2">
            {categoryMap['Fashion'].subcategories!.map((subcat) => (
              <FilterPill
                key={subcat}
                label={subcat}
                active={selectedSubCategories.includes(subcat)}
                onClick={() => onSubCategoryToggle(subcat)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
