import { useState, useRef, useEffect } from 'react';
import { Search, ShoppingBag, Utensils, Coffee, Home, Landmark, MapPin, X, Sun, Moon } from 'lucide-react';
import { FilterPill } from './FilterPill';
import type { MainCategory, Store } from '../../types/store';
import { FASHION_SUB_CATEGORIES, FOOD_SUB_CATEGORIES, HOME_GOODS_SUB_CATEGORIES } from '../../lib/constants';
import { SearchAutocomplete, type SearchSuggestion } from '../store/SearchAutocomplete';

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

  // Stores for autocomplete
  stores: Store[];
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;

  // Map style mode
  mapStyleMode?: 'day' | 'night';
  onMapStyleChange?: (mode: 'day' | 'night') => void;
}

// Category definitions with icons and subcategories
const CATEGORIES = [
  { id: 'Fashion' as MainCategory, label: 'Fashion', Icon: ShoppingBag, subcategories: FASHION_SUB_CATEGORIES },
  { id: 'Food' as MainCategory, label: 'Food', Icon: Utensils, subcategories: FOOD_SUB_CATEGORIES },
  { id: 'Coffee' as MainCategory, label: 'Coffee', Icon: Coffee, subcategories: [] },
  { id: 'Home Goods' as MainCategory, label: 'Home Goods', Icon: Home, subcategories: HOME_GOODS_SUB_CATEGORIES },
  { id: 'Museum' as MainCategory, label: 'Museum', Icon: Landmark, subcategories: [] },
];

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
  stores,
  onSelectSuggestion,
  mapStyleMode = 'day',
  onMapStyleChange,
}: MobileFilterBarProps) {
  // Track which category's subcategories are expanded
  const [expandedCategory, setExpandedCategory] = useState<MainCategory | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onSearchChange(newValue);

    // Show autocomplete if there's a query
    if (newValue.length >= 2) {
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    onSelectSuggestion(suggestion);
    setShowAutocomplete(false);

    // Clear search or set to store name based on type
    if (suggestion.type === 'store') {
      onSearchChange(suggestion.name);
    } else {
      onSearchChange(''); // Clear search when selecting location
    }
  };

  const handleClearSearch = () => {
    onSearchChange('');
    setShowAutocomplete(false);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed top-20 left-0 right-0 z-30 px-4 pointer-events-none">
      <div className="max-w-7xl mx-auto space-y-2 pointer-events-auto">
        {/* Search Bar - Floating */}
        <div className="relative" ref={searchContainerRef}>
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-30 blur-md" />
          <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl border-2 border-cyan-400/30 shadow-2xl overflow-visible">
            <div className="flex items-center gap-3 px-4 py-3">
              <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => {
                  if (searchQuery.length >= 2) setShowAutocomplete(true);
                }}
                placeholder="Search stores, neighborhoods..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-base"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="flex-shrink-0 p-1 hover:bg-gray-800 rounded-full transition-colors"
                  type="button"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-cyan-300" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {showAutocomplete && searchQuery.length >= 2 && (
              <div className="relative">
                <SearchAutocomplete
                  query={searchQuery}
                  stores={stores}
                  onSelect={handleSelectSuggestion}
                  onClose={() => setShowAutocomplete(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Category Pills - Horizontal Scroll (Google Maps style) */}
        <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-2">
          {/* Cities pill first */}
          <FilterPill
            label={
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{selectedCity ? (selectedNeighborhood ? `${selectedCity} - ${selectedNeighborhood}` : selectedCity) : 'Cities'}</span>
              </div>
            }
            active={!!(selectedCity || selectedNeighborhood)}
            hasDropdown={true}
            onClick={onOpenCityDrawer}
          />

          {/* Main category pills */}
          {CATEGORIES.map((cat) => {
            const Icon = cat.Icon;
            const isActive = selectedMainCategory === cat.id;
            const hasSubcategories = cat.subcategories.length > 0;

            return (
              <FilterPill
                key={cat.id}
                label={
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4" />
                    <span>{cat.label}</span>
                  </div>
                }
                active={isActive}
                hasDropdown={hasSubcategories}
                onClick={() => {
                  // Option A: Tap anywhere on pill toggles subcategories
                  if (hasSubcategories) {
                    // Toggle both selection and expansion
                    if (isActive && expandedCategory === cat.id) {
                      // If already selected and expanded, deselect and collapse
                      onMainCategoryChange(null);
                      setExpandedCategory(null);
                    } else {
                      // Select and expand
                      onMainCategoryChange(cat.id);
                      setExpandedCategory(cat.id);
                    }
                  } else {
                    // Categories without subcategories just toggle selection
                    onMainCategoryChange(isActive ? null : cat.id);
                  }
                }}
              />
            );
          })}

          {/* Map Style Toggle Pills - Mobile only */}
          {onMapStyleChange && (
            <>
              <FilterPill
                label={
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </div>
                }
                active={mapStyleMode === 'day'}
                onClick={() => onMapStyleChange('day')}
              />
              <FilterPill
                label={
                  <div className="flex items-center gap-1.5">
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </div>
                }
                active={mapStyleMode === 'night'}
                onClick={() => onMapStyleChange('night')}
              />
            </>
          )}
        </div>

        {/* Subcategory Pills - Show when a category is expanded */}
        {expandedCategory && CATEGORIES.find(c => c.id === expandedCategory)?.subcategories && (
          <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-2">
            {CATEGORIES.find(c => c.id === expandedCategory)!.subcategories.map((subcat) => (
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
