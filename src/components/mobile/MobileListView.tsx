import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Tag, ArrowUpDown, X, ChevronDown } from 'lucide-react';
import { BottomSheet } from '../common/BottomSheet';
import { SearchAutocomplete, type SearchSuggestion } from '../store/SearchAutocomplete';
import type { Store, MainCategory } from '../../types/store';
import { MAJOR_CITIES_JAPAN, LOCATIONS, FASHION_SUB_CATEGORIES, FOOD_SUB_CATEGORIES, HOME_GOODS_SUB_CATEGORIES } from '../../lib/constants';

interface MobileListViewProps {
  stores: Store[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedMainCategory: MainCategory | null;
  selectedSubCategories: string[];
  selectedCity: string | null;
  selectedNeighborhood: string | null;
  sortBy: string;
  onMainCategoryChange: (category: MainCategory | null) => void;
  onSubCategoryToggle: (subcategory: string) => void;
  onCityChange: (city: string | null) => void;
  onNeighborhoodChange: (neighborhood: string | null) => void;
  onSortChange: (sort: string) => void;
  onStoreClick: (store: Store) => void;
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;
  onBackToMap: () => void;
}

const CATEGORIES = [
  { id: 'Fashion' as MainCategory, label: 'Fashion', subcategories: FASHION_SUB_CATEGORIES },
  { id: 'Food' as MainCategory, label: 'Food', subcategories: FOOD_SUB_CATEGORIES },
  { id: 'Coffee' as MainCategory, label: 'Coffee', subcategories: [] },
  { id: 'Home Goods' as MainCategory, label: 'Home Goods', subcategories: HOME_GOODS_SUB_CATEGORIES },
  { id: 'Museum' as MainCategory, label: 'Museum', subcategories: [] },
];

const SORT_OPTIONS = [
  { value: 'alphabetical', label: 'A-Z' },
  { value: 'reverse-alphabetical', label: 'Z-A' },
  { value: 'newest', label: 'Newest First' },
];

export function MobileListView({
  stores,
  searchQuery,
  onSearchChange,
  selectedMainCategory,
  selectedSubCategories,
  selectedCity,
  selectedNeighborhood,
  sortBy,
  onMainCategoryChange,
  onSubCategoryToggle,
  onCityChange,
  onNeighborhoodChange,
  onSortChange,
  onStoreClick,
  onSelectSuggestion,
  onBackToMap,
}: MobileListViewProps) {
  const [showCitySheet, setShowCitySheet] = useState(false);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);
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

    if (newValue.length >= 2) {
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    onSelectSuggestion(suggestion);
    setShowAutocomplete(false);

    if (suggestion.type === 'store') {
      onSearchChange(suggestion.name);
    } else {
      onSearchChange('');
    }
  };

  const handleClearSearch = () => {
    onSearchChange('');
    setShowAutocomplete(false);
    inputRef.current?.focus();
  };

  // Get active filter labels
  const cityLabel = selectedCity
    ? (selectedNeighborhood ? `${selectedCity} - ${selectedNeighborhood}` : selectedCity)
    : 'Cities';

  const categoryLabel = selectedMainCategory || 'Categories';
  const sortLabel = SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || 'Sort';

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Film grain */}
      <div className="absolute inset-0 film-grain opacity-20 pointer-events-none" />

      {/* Content */}
      <div className="relative">
        {/* Search Bar */}
        <div className="sticky top-16 z-20 bg-gradient-to-b from-black via-gray-900 to-transparent pb-4 px-4 pt-4">
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

          {/* Filter Pills Row */}
          <div className="flex gap-2 mt-3">
            {/* Cities Filter */}
            <button
              onClick={() => setShowCitySheet(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all min-w-0 ${
                selectedCity
                  ? 'bg-cyan-500/30 text-white border-2 border-cyan-400/50'
                  : 'bg-gray-800/60 text-gray-300 border border-gray-600/40'
              }`}
              style={{
                boxShadow: selectedCity
                  ? '0 0 20px rgba(34, 217, 238, 0.6), 0 0 40px rgba(34, 217, 238, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{cityLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
            </button>

            {/* Categories Filter */}
            <button
              onClick={() => setShowCategorySheet(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all min-w-0 ${
                selectedMainCategory
                  ? 'bg-cyan-500/30 text-white border-2 border-cyan-400/50'
                  : 'bg-gray-800/60 text-gray-300 border border-gray-600/40'
              }`}
              style={{
                boxShadow: selectedMainCategory
                  ? '0 0 20px rgba(34, 217, 238, 0.6), 0 0 40px rgba(34, 217, 238, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Tag className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{categoryLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
            </button>

            {/* Sort Filter */}
            <button
              onClick={() => setShowSortSheet(true)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all bg-gray-800/60 text-gray-300 border border-gray-600/40 min-w-0"
              style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)' }}
            >
              <ArrowUpDown className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{sortLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
            </button>
          </div>

          {/* Store Count */}
          <div className="mt-3 text-sm text-center">
            <span className="font-bold text-white">{stores.length}</span>{' '}
            <span className="text-gray-400">stores</span>
          </div>
        </div>

        {/* Store Grid - 2 Columns */}
        <div className="px-4 pb-20">
          <div className="grid grid-cols-2 gap-4">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => onStoreClick(store)}
                className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all active:scale-95 text-left"
              >
                {/* Store Image */}
                <div className="aspect-square bg-gray-900 relative overflow-hidden flex items-center justify-center">
                  {store.photos && store.photos.length > 0 ? (
                    <img
                      src={store.photos[0]}
                      alt={store.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-600">
                      <span className="text-4xl">📍</span>
                    </div>
                  )}
                </div>

                {/* Store Info */}
                <div className="p-3">
                  <h3 className="font-bold text-white text-sm mb-1 line-clamp-1">
                    {store.name}
                  </h3>
                  {store.neighborhood && (
                    <p className="text-xs text-gray-400 mb-1 line-clamp-1">
                      {store.neighborhood}
                    </p>
                  )}
                  {store.mainCategory && (
                    <span className="inline-block px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-400/30">
                      {store.mainCategory}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Map View Button - Fixed Bottom */}
        <button
          onClick={onBackToMap}
          className="fixed bottom-6 right-6 z-30 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm border-2 border-cyan-300/50"
          style={{ boxShadow: '0 0 30px rgba(34, 217, 238, 0.4), 0 10px 40px rgba(0, 0, 0, 0.3)' }}
        >
          <MapPin className="w-5 h-5" />
          Map View
        </button>
      </div>

      {/* City/Neighborhood Bottom Sheet - Reuse from map view */}
      <BottomSheet
        isOpen={showCitySheet}
        onClose={() => setShowCitySheet(false)}
        title="Select Location"
      >
        <div className="space-y-6">
          {/* City Selection */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-3 italic" style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
              City
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onCityChange(null);
                  setShowCitySheet(false);
                }}
                className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                  !selectedCity
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-cyan-300'
                    : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
                style={!selectedCity ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
              >
                All Cities
              </button>

              {MAJOR_CITIES_JAPAN.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    onCityChange(city);
                    if (!LOCATIONS[city] || LOCATIONS[city].length === 0) {
                      setShowCitySheet(false);
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                    selectedCity === city
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-cyan-300'
                      : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                  style={selectedCity === city ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Neighborhood Selection */}
          {selectedCity && LOCATIONS[selectedCity] && LOCATIONS[selectedCity].length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-3 italic" style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
                Neighborhoods in {selectedCity}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onNeighborhoodChange(null);
                    setShowCitySheet(false);
                  }}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                    !selectedNeighborhood
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-cyan-300'
                      : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                  style={!selectedNeighborhood ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
                >
                  All Neighborhoods
                </button>

                {LOCATIONS[selectedCity].map((neighborhood) => (
                  <button
                    key={neighborhood}
                    onClick={() => {
                      onNeighborhoodChange(neighborhood);
                      setShowCitySheet(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                      selectedNeighborhood === neighborhood
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-cyan-300'
                        : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                    style={selectedNeighborhood === neighborhood ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
                  >
                    {neighborhood}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Categories Bottom Sheet */}
      <BottomSheet
        isOpen={showCategorySheet}
        onClose={() => setShowCategorySheet(false)}
        title="Select Category"
      >
        <div className="space-y-6">
          {/* Main Categories */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-3 italic" style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
              Main Category
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onMainCategoryChange(null);
                  setShowCategorySheet(false);
                }}
                className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                  !selectedMainCategory
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-cyan-300'
                    : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
                style={!selectedMainCategory ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
              >
                All Categories
              </button>

              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onMainCategoryChange(cat.id);
                    if (cat.subcategories.length === 0) {
                      setShowCategorySheet(false);
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                    selectedMainCategory === cat.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-cyan-300'
                      : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                  style={selectedMainCategory === cat.id ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories */}
          {selectedMainCategory && CATEGORIES.find(c => c.id === selectedMainCategory)?.subcategories.length! > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-3 italic" style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
                Subcategories
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.find(c => c.id === selectedMainCategory)!.subcategories.map((subcat) => {
                  const isSelected = selectedSubCategories.includes(subcat);
                  return (
                    <label
                      key={subcat}
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
                        onChange={() => onSubCategoryToggle(subcat)}
                        className="w-4 h-4 text-cyan-500 bg-gray-700 border-cyan-400/50 rounded focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0 focus:ring-offset-gray-900"
                      />
                      <span className={`text-sm font-bold transition-colors ${
                        isSelected ? 'text-cyan-300' : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {subcat}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Sort Bottom Sheet */}
      <BottomSheet
        isOpen={showSortSheet}
        onClose={() => setShowSortSheet(false)}
        title="Sort By"
      >
        <div className="space-y-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSortChange(option.value);
                setShowSortSheet(false);
              }}
              className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                sortBy === option.value
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-cyan-300'
                  : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
              }`}
              style={sortBy === option.value ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
            >
              {option.label}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
