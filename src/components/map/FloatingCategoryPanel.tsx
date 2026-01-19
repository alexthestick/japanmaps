import { useState } from 'react';
import { MapPin, ShoppingBag, Utensils, Coffee, Home, Landmark, ChevronDown, Dices, RotateCcw } from 'lucide-react';
import type { MainCategory, Store } from '../../types/store';
import { FASHION_SUB_CATEGORIES, FOOD_SUB_CATEGORIES, HOME_GOODS_SUB_CATEGORIES, MAJOR_CITIES_JAPAN, LOCATIONS } from '../../lib/constants';
import { FilterModal } from '../common/FilterModal';

interface FloatingCategoryPanelProps {
  selectedMainCategory: MainCategory | null;
  selectedSubCategories: string[];
  selectedCity: string | null;
  selectedNeighborhood: string | null;
  onMainCategoryChange: (category: MainCategory | null) => void;
  onSubCategoryToggle: (subcategory: string) => void;
  onCityChange: (city: string | null) => void;
  onNeighborhoodChange: (neighborhood: string | null) => void;
  stores?: Store[];
  onRandomStore?: (store: Store) => void;
  onClearAll?: () => void;
}

// FIXED ORDER - No random shuffle
const CATEGORIES = [
  { id: 'Fashion' as MainCategory, label: 'Fashion', icon: ShoppingBag, hasSubcategories: true },
  { id: 'Food' as MainCategory, label: 'Food', icon: Utensils, hasSubcategories: true },
  { id: 'Coffee' as MainCategory, label: 'Coffee', icon: Coffee, hasSubcategories: false },
  { id: 'Home Goods' as MainCategory, label: 'Home Goods', icon: Home, hasSubcategories: true },
  { id: 'Museum' as MainCategory, label: 'Museum', icon: Landmark, hasSubcategories: false },
  { id: 'Spots' as MainCategory, label: 'Spots', icon: MapPin, hasSubcategories: false },
];

const SUBCATEGORY_MAP: Record<string, readonly string[]> = {
  Fashion: FASHION_SUB_CATEGORIES,
  Food: FOOD_SUB_CATEGORIES,
  'Home Goods': HOME_GOODS_SUB_CATEGORIES,
};

// Use the official LOCATIONS from constants
const CITY_NEIGHBORHOODS: Record<string, readonly string[]> = LOCATIONS;

export function FloatingCategoryPanel({
  selectedMainCategory,
  selectedSubCategories,
  selectedCity,
  selectedNeighborhood,
  onMainCategoryChange,
  onSubCategoryToggle,
  onCityChange,
  onNeighborhoodChange,
  stores = [],
  onRandomStore,
  onClearAll,
}: FloatingCategoryPanelProps) {
  const [activeModal, setActiveModal] = useState<'subcategory' | 'city' | null>(null);
  const [modalCategory, setModalCategory] = useState<MainCategory | null>(null);

  // Temporary state for modal selections (before Apply)
  const [tempSubCategories, setTempSubCategories] = useState<string[]>([]);
  const [tempCity, setTempCity] = useState<string | null>(null);
  const [tempNeighborhoods, setTempNeighborhoods] = useState<string[]>([]);

  // Handle clicking the category label (not arrow)
  const handleCategoryLabelClick = (categoryId: MainCategory) => {
    // Just toggle the main category selection (show ALL stores in that category)
    onMainCategoryChange(selectedMainCategory === categoryId ? null : categoryId);
  };

  // Handle clicking the arrow icon (open modal)
  const handleArrowClick = (e: React.MouseEvent, categoryId: MainCategory) => {
    e.stopPropagation(); // Prevent label click from firing
    setModalCategory(categoryId);
    setTempSubCategories(selectedSubCategories);
    setActiveModal('subcategory');
    // Also select the main category
    onMainCategoryChange(selectedMainCategory === categoryId ? null : categoryId);
  };

  const handleCitiesClick = () => {
    setTempCity(selectedCity);
    setTempNeighborhoods(selectedNeighborhood ? [selectedNeighborhood] : []);
    setActiveModal('city');
  };

  const handleSubCategoryApply = () => {
    // Apply all temp selections
    tempSubCategories.forEach(sub => {
      if (!selectedSubCategories.includes(sub)) {
        onSubCategoryToggle(sub);
      }
    });
    // Remove unselected
    selectedSubCategories.forEach(sub => {
      if (!tempSubCategories.includes(sub)) {
        onSubCategoryToggle(sub);
      }
    });
  };

  const handleCityApply = () => {
    onCityChange(tempCity);
    onNeighborhoodChange(tempNeighborhoods.length > 0 ? tempNeighborhoods[0] : null);
  };

  const handleSubCategoryClear = () => {
    setTempSubCategories([]);
  };

  const handleCityClear = () => {
    setTempCity(null);
    setTempNeighborhoods([]);
  };

  const subcategories = modalCategory ? SUBCATEGORY_MAP[modalCategory] || [] : [];
  const availableNeighborhoods = tempCity ? CITY_NEIGHBORHOODS[tempCity] || [] : [];

  const citiesButtonText = selectedCity
    ? selectedNeighborhood
      ? `${selectedCity} - ${selectedNeighborhood}`
      : selectedCity
    : 'Cities';

  return (
    <>
      <div className="absolute top-5 left-[365px] z-20 scale-90 origin-top-left">
        {/* Main Category Pills with Kirby theme */}
        <div className="relative bg-gray-900/95 backdrop-blur-md rounded-xl shadow-lg border-2 border-cyan-400/40 px-2.5 py-1.5 overflow-hidden" style={{ boxShadow: '0 0 20px rgba(34, 217, 238, 0.3)' }}>
          {/* Film grain */}
          <div className="absolute inset-0 film-grain opacity-10 pointer-events-none" />

          {/* Corner decorations */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-lg z-0" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-purple-400/60 rounded-br-lg z-0" />

          <div className="flex items-center gap-1.5 relative z-10">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedMainCategory === cat.id;
              const hasActiveSubcategories = cat.hasSubcategories && selectedSubCategories.length > 0;

              return (
                <div
                  key={cat.id}
                  className={`
                    relative rounded-lg transition-all flex items-center
                    ${isSelected
                      ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white shadow-sm border border-cyan-400/50'
                      : 'bg-transparent text-gray-300 hover:bg-gray-800'
                    }
                  `}
                  style={isSelected ? { boxShadow: '0 0 10px rgba(34, 217, 238, 0.2)' } : {}}
                >
                  {/* Main button - Click to select category */}
                  <button
                    onClick={() => handleCategoryLabelClick(cat.id)}
                    className="px-3 py-1.5 text-sm font-medium flex items-center gap-1.5"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>

                  {/* Arrow button - Click to open modal (only if has subcategories) */}
                  {cat.hasSubcategories && (
                    <button
                      onClick={(e) => handleArrowClick(e, cat.id)}
                      className="pr-2.5 pl-0.5 py-1.5 hover:opacity-70 transition-opacity"
                    >
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>
                  )}

                  {/* Cyan indicator dot when subcategories are active */}
                  {hasActiveSubcategories && isSelected && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full" style={{ boxShadow: '0 0 6px rgba(34, 217, 238, 0.8)' }} />
                  )}
                </div>
              );
            })}

            {/* Cities Button */}
            <button
              onClick={handleCitiesClick}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 border-l border-cyan-400/30 ml-1 pl-2.5
                ${selectedCity
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white shadow-sm border border-cyan-400/50'
                  : 'bg-transparent text-gray-300 hover:bg-gray-800'
                }
              `}
              style={selectedCity ? { boxShadow: '0 0 10px rgba(34, 217, 238, 0.2)' } : {}}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="max-w-[120px] truncate">{citiesButtonText}</span>
              <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-cyan-400/30 mx-1" />

            {/* Random Store Button */}
            {onRandomStore && stores.length > 0 && (
              <button
                onClick={() => {
                  const randomIndex = Math.floor(Math.random() * stores.length);
                  onRandomStore(stores[randomIndex]);
                }}
                className="p-1.5 rounded-lg text-gray-300 hover:text-cyan-300 hover:bg-gray-800 transition-all"
                title="Random store"
              >
                <Dices className="w-4 h-4" />
              </button>
            )}

            {/* Clear All Filters Button */}
            {onClearAll && (selectedMainCategory || selectedSubCategories.length > 0 || selectedCity || selectedNeighborhood) && (
              <button
                onClick={onClearAll}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
                title="Clear all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subcategory Modal */}
      <FilterModal
        isOpen={activeModal === 'subcategory'}
        onClose={() => setActiveModal(null)}
        title={`${modalCategory} Styles`}
        onApply={handleSubCategoryApply}
        onClear={handleSubCategoryClear}
      >
        <div className="grid grid-cols-2 gap-3">
          {subcategories.map((sub) => {
            const isSelected = tempSubCategories.includes(sub);
            return (
              <label
                key={sub}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all group border ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50 hover:from-cyan-500/30 hover:to-blue-500/30'
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600'
                }`}
                style={isSelected ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    setTempSubCategories(prev =>
                      prev.includes(sub)
                        ? prev.filter(s => s !== sub)
                        : [...prev, sub]
                    );
                  }}
                  className="w-4 h-4 text-cyan-500 bg-gray-700 border-cyan-400/50 rounded focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0 focus:ring-offset-gray-900"
                />
                <span className={`text-sm font-bold transition-colors ${
                  isSelected ? 'text-cyan-300' : 'text-gray-300 group-hover:text-white'
                }`}>
                  {sub}
                </span>
              </label>
            );
          })}
        </div>
      </FilterModal>

      {/* City + Neighborhood Selection Modal - Two Column Layout */}
      <FilterModal
        isOpen={activeModal === 'city'}
        onClose={() => setActiveModal(null)}
        title="Select Location"
        onApply={handleCityApply}
        onClear={handleCityClear}
      >
        <div className="grid grid-cols-2 gap-6 min-h-[400px]">
          {/* Left Column - City Selection */}
          <div className="border-r border-cyan-400/20 pr-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-4 italic" style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
              City
            </h3>
            <div className="space-y-1 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              <label className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-all group">
                <input
                  type="radio"
                  checked={tempCity === null}
                  onChange={() => {
                    setTempCity(null);
                    setTempNeighborhoods([]);
                  }}
                  className="w-4 h-4 text-cyan-500 bg-gray-700 border-cyan-400/50 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0 focus:ring-offset-gray-900"
                />
                <span className={`text-sm font-bold transition-colors ${tempCity === null ? 'text-cyan-300' : 'text-gray-400 group-hover:text-white'}`}>
                  All Cities
                </span>
              </label>
              {MAJOR_CITIES_JAPAN.map((city) => (
                <label
                  key={city}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-all group"
                >
                  <input
                    type="radio"
                    checked={tempCity === city}
                    onChange={() => {
                      setTempCity(city);
                      setTempNeighborhoods([]);
                    }}
                    className="w-4 h-4 text-cyan-500 bg-gray-700 border-cyan-400/50 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0 focus:ring-offset-gray-900"
                  />
                  <span className={`text-sm font-bold transition-colors ${tempCity === city ? 'text-cyan-300' : 'text-gray-400 group-hover:text-white'}`}>
                    {city}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Right Column - Neighborhood Selection */}
          <div className="pl-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-4 italic" style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
              Neighborhoods {tempCity && `in ${tempCity}`}
            </h3>
            {tempCity && availableNeighborhoods.length > 0 ? (
              <div className="space-y-1 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {availableNeighborhoods.map((neighborhood) => (
                  <label
                    key={neighborhood}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-all group"
                  >
                    <input
                      type="checkbox"
                      checked={tempNeighborhoods.includes(neighborhood)}
                      onChange={() => {
                        setTempNeighborhoods(prev =>
                          prev.includes(neighborhood)
                            ? prev.filter(n => n !== neighborhood)
                            : [...prev, neighborhood]
                        );
                      }}
                      className="w-4 h-4 text-cyan-500 bg-gray-700 border-cyan-400/50 rounded focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0 focus:ring-offset-gray-900"
                    />
                    <span className={`text-sm font-bold transition-colors ${tempNeighborhoods.includes(neighborhood) ? 'text-cyan-300' : 'text-gray-400 group-hover:text-white'}`}>
                      {neighborhood}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-center px-4">
                <p className="text-sm text-gray-500 italic">
                  {tempCity ? 'No neighborhoods available' : 'Select a city to view neighborhoods'}
                </p>
              </div>
            )}
          </div>
        </div>
      </FilterModal>
    </>
  );
}
