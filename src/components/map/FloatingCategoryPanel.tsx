import { useState } from 'react';
import { MapPin, ShoppingBag, Utensils, Coffee, Home, Landmark, ChevronDown } from 'lucide-react';
import type { MainCategory } from '../../types/store';
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
}

// FIXED ORDER - No random shuffle
const CATEGORIES = [
  { id: 'Fashion' as MainCategory, label: 'Fashion', icon: ShoppingBag, hasSubcategories: true },
  { id: 'Food' as MainCategory, label: 'Food', icon: Utensils, hasSubcategories: true },
  { id: 'Coffee' as MainCategory, label: 'Coffee', icon: Coffee, hasSubcategories: false },
  { id: 'Home Goods' as MainCategory, label: 'Home Goods', icon: Home, hasSubcategories: true },
  { id: 'Museum' as MainCategory, label: 'Museum', icon: Landmark, hasSubcategories: false },
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
        {/* Main Category Pills */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
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
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-transparent text-gray-700 hover:bg-gray-100'
                    }
                  `}
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

                  {/* Blue indicator dot when subcategories are active */}
                  {hasActiveSubcategories && isSelected && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  )}
                </div>
              );
            })}

            {/* Cities Button */}
            <button
              onClick={handleCitiesClick}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 border-l border-gray-300 ml-1 pl-2.5
                ${selectedCity
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-transparent text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="max-w-[120px] truncate">{citiesButtonText}</span>
              <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
            </button>
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
                    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className={`text-sm font-medium transition-colors ${
                  isSelected ? 'text-blue-700' : 'text-gray-900 group-hover:text-gray-700'
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
          <div className="border-r border-gray-200 pr-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
              City
            </h3>
            <div className="space-y-1 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              <label className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all group">
                <input
                  type="radio"
                  checked={tempCity === null}
                  onChange={() => {
                    setTempCity(null);
                    setTempNeighborhoods([]);
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className={`text-sm font-medium transition-colors ${tempCity === null ? 'text-blue-600' : 'text-gray-900 group-hover:text-gray-700'}`}>
                  All Cities
                </span>
              </label>
              {MAJOR_CITIES_JAPAN.map((city) => (
                <label
                  key={city}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all group"
                >
                  <input
                    type="radio"
                    checked={tempCity === city}
                    onChange={() => {
                      setTempCity(city);
                      setTempNeighborhoods([]);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className={`text-sm font-medium transition-colors ${tempCity === city ? 'text-blue-600' : 'text-gray-900 group-hover:text-gray-700'}`}>
                    {city}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Right Column - Neighborhood Selection */}
          <div className="pl-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
              Neighborhoods {tempCity && `in ${tempCity}`}
            </h3>
            {tempCity && availableNeighborhoods.length > 0 ? (
              <div className="space-y-1 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {availableNeighborhoods.map((neighborhood) => (
                  <label
                    key={neighborhood}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all group"
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
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className={`text-sm font-medium transition-colors ${tempNeighborhoods.includes(neighborhood) ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'}`}>
                      {neighborhood}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-center px-4">
                <p className="text-sm text-gray-400">
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
