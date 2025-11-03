import { CategoryButton } from './CategoryButton';
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

  // Dropdown visibility
  onOpenCityDrawer: () => void;
}

/**
 * Mobile-only top filter bar for map view
 * Displays horizontal scrolling categories and filter pills
 * Inspired by Google Maps and Disneyland app patterns
 */
export function MobileFilterBar({
  selectedMainCategory,
  onMainCategoryChange,
  selectedSubCategories,
  onSubCategoryToggle,
  selectedCity,
  selectedNeighborhood,
  onOpenCityDrawer,
}: MobileFilterBarProps) {

  // Main categories with icons
  const mainCategories: Array<{ category: MainCategory | null; icon: string; label: MainCategory | 'All' }> = [
    { category: null, icon: '🗺️', label: 'All' },
    { category: 'Fashion', icon: '👔', label: 'Fashion' },
    { category: 'Food', icon: '🍜', label: 'Food' },
    { category: 'Culture', icon: '🎨', label: 'Culture' },
    { category: 'Nightlife', icon: '🌙', label: 'Nightlife' },
  ];

  // Fashion subcategories (shown when Fashion is selected)
  const fashionSubcategories = [
    'Vintage',
    'Thrift',
    'Designer',
    'Streetwear',
    'Boutique',
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/95 via-black/90 to-black/80 backdrop-blur-md border-b border-cyan-400/20">
      <div className="relative z-10">
        {/* Main Categories - Horizontal Scroll */}
        <div className="flex overflow-x-auto gap-2 px-4 py-3 scrollbar-hide">
          {mainCategories.map(({ category, icon, label }) => (
            <CategoryButton
              key={label}
              icon={icon}
              label={label}
              active={selectedMainCategory === category}
              onClick={() => onMainCategoryChange(category)}
            />
          ))}
        </div>

        {/* Filter Pills - Horizontal Scroll */}
        <div className="flex overflow-x-auto gap-2 px-4 pb-3 scrollbar-hide">
          {/* City/Location Filter */}
          <FilterPill
            label={selectedCity || selectedNeighborhood || 'Location'}
            active={!!(selectedCity || selectedNeighborhood)}
            hasDropdown
            onClick={onOpenCityDrawer}
          />

          {/* Fashion Subcategories (only show when Fashion is selected) */}
          {selectedMainCategory === 'Fashion' && fashionSubcategories.map((subcat) => (
            <FilterPill
              key={subcat}
              label={subcat}
              active={selectedSubCategories.includes(subcat)}
              onClick={() => onSubCategoryToggle(subcat)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
