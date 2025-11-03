import { HierarchicalLocationList } from './HierarchicalLocationList';
import { Shirt, UtensilsCrossed, Coffee, Home, Building2 } from 'lucide-react';
import type { MainCategory } from '../../types/store';
import { FASHION_SUB_CATEGORIES, FOOD_SUB_CATEGORIES, HOME_GOODS_SUB_CATEGORIES } from '../../lib/constants';

interface ListViewSidebarProps {
  selectedMainCategory: MainCategory | null;
  selectedSubCategories: string[];
  selectedCity: string | null;
  selectedNeighborhood: string | null;
  onMainCategoryChange: (category: MainCategory | null) => void;
  onSubCategoryToggle: (subCategory: string) => void;
  onCityChange: (city: string | null) => void;
  onNeighborhoodChange: (neighborhood: string | null) => void;
  onClearAll: () => void;
}

const MAIN_CATEGORIES = [
  { id: 'Fashion' as MainCategory, label: 'Fashion', icon: Shirt },
  { id: 'Food' as MainCategory, label: 'Food', icon: UtensilsCrossed },
  { id: 'Coffee' as MainCategory, label: 'Coffee', icon: Coffee },
  { id: 'Home Goods' as MainCategory, label: 'Home Goods', icon: Home },
  { id: 'Museum' as MainCategory, label: 'Museum', icon: Building2 },
];

export function ListViewSidebar({
  selectedMainCategory,
  selectedSubCategories,
  selectedCity,
  selectedNeighborhood,
  onMainCategoryChange,
  onSubCategoryToggle,
  onCityChange,
  onNeighborhoodChange,
  onClearAll,
}: ListViewSidebarProps) {
  const hasActiveFilters = selectedMainCategory || selectedSubCategories.length > 0 || selectedCity || selectedNeighborhood;

  // Get subcategories for selected main category
  const getSubCategories = (): string[] => {
    if (!selectedMainCategory) return [];

    switch (selectedMainCategory) {
      case 'Fashion':
        return FASHION_SUB_CATEGORIES;
      case 'Food':
        return FOOD_SUB_CATEGORIES;
      case 'Home Goods':
        return HOME_GOODS_SUB_CATEGORIES;
      default:
        return [];
    }
  };

  const subCategories = getSubCategories();

  return (
    <aside className="relative w-60 bg-gradient-to-b from-gray-900 via-black to-gray-900 border-r-2 border-cyan-400/20 p-6 min-h-screen">
      {/* Film grain */}
      <div className="absolute inset-0 film-grain opacity-20 pointer-events-none" />

      {/* Corner decorations */}
      <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-cyan-400/30" />
      <div className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-cyan-400/30" />

      <div className="relative space-y-6">
        {/* Category Section */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-3 italic"
              style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
            CATEGORY
          </h3>
          <div className="space-y-1">
            {/* All Categories */}
            <button
              onClick={() => onMainCategoryChange(null)}
              className={`
                w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${!selectedMainCategory
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white font-bold border border-cyan-400/50'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-cyan-300'
                }
              `}
              style={!selectedMainCategory ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
            >
              All
            </button>

            {/* Individual categories */}
            {MAIN_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedMainCategory === cat.id;

              return (
                <div key={cat.id}>
                  <button
                    onClick={() => onMainCategoryChange(isSelected ? null : cat.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                      ${isSelected
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white font-bold border border-cyan-400/50'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-cyan-300'
                      }
                    `}
                    style={isSelected ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-300' : ''}`} />
                    {cat.label}
                  </button>

                  {/* Subcategories - Kirby themed */}
                  {isSelected && subCategories.length > 0 && (
                    <div className="ml-5 mt-1 space-y-0.5">
                      {subCategories.map((subCat) => {
                        const isSubSelected = selectedSubCategories.includes(subCat);
                        return (
                          <button
                            key={subCat}
                            onClick={() => onSubCategoryToggle(subCat)}
                            className={`
                              w-full text-left px-2 py-1 text-xs transition-all rounded
                              ${isSubSelected
                                ? 'text-cyan-300 font-bold bg-cyan-500/10'
                                : 'text-gray-500 hover:text-cyan-300 hover:bg-gray-800'
                              }
                            `}
                          >
                            {subCat}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Location Section - Kirby themed */}
        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-3 italic"
              style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
            LOCATION
          </h3>
          <HierarchicalLocationList
            selectedCity={selectedCity}
            selectedNeighborhood={selectedNeighborhood}
            onCityChange={onCityChange}
            onNeighborhoodChange={(city, neighborhood) => {
              onNeighborhoodChange(neighborhood);
            }}
          />
        </div>

        {/* Clear All */}
        {hasActiveFilters && (
          <div className="border-t border-gray-800 pt-6">
            <button
              onClick={onClearAll}
              className="w-full px-4 py-2 border-2 border-red-400/50 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/20 hover:border-red-400 transition-all"
              style={{ boxShadow: '0 0 15px rgba(239, 68, 68, 0.2)' }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
