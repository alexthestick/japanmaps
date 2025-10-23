import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { STORE_CATEGORIES, PRICE_RANGES, MAJOR_CITIES_JAPAN, LOCATIONS } from '../../lib/constants';
import { SearchAutocomplete, type SearchSuggestion } from './SearchAutocomplete';
import type { StoreFilters as Filters, Store } from '../../types/store';

interface StoreFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  stores: Store[];
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
}

export function StoreFilters({ filters, onChange, stores, onSuggestionSelect }: StoreFiltersProps) {
  // Local state for search input (user's current typing)
  const [searchInput, setSearchInput] = useState(filters.searchQuery || '');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle Enter key press to trigger search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onChange({ ...filters, searchQuery: searchInput });
      setShowAutocomplete(false);
    }
  };

  // Handle autocomplete suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'store') {
      // For store suggestions, set search to store name and trigger callback
      setSearchInput(suggestion.name);
      onChange({ ...filters, searchQuery: suggestion.name });
      if (onSuggestionSelect) {
        onSuggestionSelect(suggestion);
      }
    } else {
      // For location suggestions, filter by that location
      const newFilters = { ...filters };
      
      if (suggestion.neighborhood) {
        newFilters.cities = [suggestion.city!];
        newFilters.selectedCity = suggestion.city!;
        newFilters.selectedNeighborhood = suggestion.neighborhood;
      } else if (suggestion.city) {
        newFilters.cities = [suggestion.city];
        newFilters.selectedCity = suggestion.city;
        newFilters.selectedNeighborhood = null;
      }
      
      setSearchInput('');
      onChange(newFilters);
      if (onSuggestionSelect) {
        onSuggestionSelect(suggestion);
      }
    }
    setShowAutocomplete(false);
  };

  // Click outside to close autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show autocomplete when typing 2+ characters
  useEffect(() => {
    if (searchInput.length >= 2) {
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  }, [searchInput]);
  const handleCityChange = (city: string) => {
    if (city === 'all') {
      onChange({ 
        ...filters, 
        cities: [], 
        selectedCity: null,
        selectedNeighborhood: null // Reset neighborhood when city is cleared
      });
    } else {
      onChange({ 
        ...filters, 
        cities: [city],
        selectedCity: city,
        selectedNeighborhood: null // Reset neighborhood when city changes
      });
    }
  };

  const handleNeighborhoodChange = (neighborhood: string) => {
    if (neighborhood === 'all') {
      onChange({ ...filters, selectedNeighborhood: null });
    } else {
      onChange({ ...filters, selectedNeighborhood: neighborhood });
    }
  };

  const handleCategoryChange = (category: string) => {
    if (category === 'all') {
      onChange({ ...filters, categories: [], selectedCategory: null });
    } else {
      onChange({ ...filters, categories: [category as any], selectedCategory: category });
    }
  };

  const handlePriceChange = (price: string) => {
    if (price === 'all') {
      onChange({ ...filters, priceRanges: [], selectedPrice: null });
    } else {
      onChange({ ...filters, priceRanges: [price as any], selectedPrice: price });
    }
  };

  const clearFilters = () => {
    setSearchInput(''); // Reset local search input
    onChange({
      countries: [],
      cities: [],
      categories: [],
      priceRanges: [],
      searchQuery: '',
      selectedCity: null,
      selectedNeighborhood: null,
      selectedCategory: null,
      selectedPrice: null,
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.priceRanges.length > 0 ||
    filters.cities.length > 0 ||
    filters.searchQuery ||
    filters.selectedNeighborhood;

  const selectedCity = filters.selectedCity || (filters.cities.length > 0 ? filters.cities[0] : null);
  const selectedNeighborhood = filters.selectedNeighborhood || null;
  const selectedCategory = filters.selectedCategory || (filters.categories.length > 0 ? filters.categories[0] : null);
  const selectedPrice = filters.selectedPrice || (filters.priceRanges.length > 0 ? filters.priceRanges[0] : null);

  // Get neighborhoods for selected city
  const availableNeighborhoods = selectedCity && selectedCity !== 'all' 
    ? LOCATIONS[selectedCity as keyof typeof LOCATIONS] || []
    : [];

  return (
    <div className="flex flex-col lg:flex-row gap-3 items-stretch">
      {/* Search Input with Autocomplete */}
      <div ref={searchContainerRef} className="relative lg:flex-[1.5] z-50">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
        <input
          type="text"
          placeholder="Search stores or areas..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          onFocus={() => searchInput.length >= 2 && setShowAutocomplete(true)}
          className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent relative z-10"
        />
        
        {/* Autocomplete Dropdown */}
        {showAutocomplete && (
          <SearchAutocomplete
            query={searchInput}
            stores={stores}
            onSelect={handleSuggestionSelect}
            onClose={() => setShowAutocomplete(false)}
          />
        )}
      </div>

      {/* City Dropdown */}
      <div className="relative lg:flex-[0.9]">
        <select
          value={selectedCity || 'all'}
          onChange={(e) => handleCityChange(e.target.value)}
          className={`w-full h-12 pl-4 pr-10 rounded-lg text-sm appearance-none cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            !selectedCity || selectedCity === 'all'
              ? 'bg-gray-100 text-gray-500 border border-gray-200 font-normal hover:bg-gray-200'
              : 'bg-blue-500 text-white border-none shadow-sm font-medium'
          }`}
        >
          <option value="all">All Cities</option>
          {MAJOR_CITIES_JAPAN.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${
          !selectedCity || selectedCity === 'all' ? 'text-gray-500' : 'text-white'
        }`} />
      </div>

      {/* Neighborhood Dropdown - Only visible when city is selected */}
      {selectedCity && selectedCity !== 'all' && availableNeighborhoods.length > 0 && (
        <div className="relative lg:flex-[0.9]">
          <select
            value={selectedNeighborhood || 'all'}
            onChange={(e) => handleNeighborhoodChange(e.target.value)}
            className={`w-full h-12 pl-4 pr-10 rounded-lg text-sm appearance-none cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !selectedNeighborhood || selectedNeighborhood === 'all'
                ? 'bg-gray-100 text-gray-500 border border-gray-200 font-normal hover:bg-gray-200'
                : 'bg-blue-500 text-white border-none shadow-sm font-medium'
            }`}
          >
            <option value="all">All Areas</option>
            {availableNeighborhoods.map(neighborhood => (
              <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
            ))}
          </select>
          <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${
            !selectedNeighborhood || selectedNeighborhood === 'all' ? 'text-gray-500' : 'text-white'
          }`} />
        </div>
      )}

      {/* Category Dropdown */}
      <div className="relative lg:flex-[0.9]">
        <select
          value={selectedCategory || 'all'}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className={`w-full h-12 pl-4 pr-10 rounded-lg text-sm appearance-none cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            !selectedCategory || selectedCategory === 'all'
              ? 'bg-gray-100 text-gray-500 border border-gray-200 font-normal hover:bg-gray-200'
              : 'bg-blue-500 text-white border-none shadow-sm font-medium'
          }`}
        >
          <option value="all">All Styles</option>
          {STORE_CATEGORIES.map(category => (
            <option key={category} value={category} className="capitalize">
              {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${
          !selectedCategory || selectedCategory === 'all' ? 'text-gray-500' : 'text-white'
        }`} />
      </div>

      {/* Price Dropdown */}
      <div className="relative lg:flex-[0.6]">
        <select
          value={selectedPrice || 'all'}
          onChange={(e) => handlePriceChange(e.target.value)}
          className={`w-full h-12 pl-4 pr-10 rounded-lg text-sm appearance-none cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            !selectedPrice || selectedPrice === 'all'
              ? 'bg-gray-100 text-gray-500 border border-gray-200 font-normal hover:bg-gray-200'
              : 'bg-blue-500 text-white border-none shadow-sm font-medium'
          }`}
        >
          <option value="all">All Prices</option>
          {PRICE_RANGES.map(price => (
            <option key={price} value={price}>{price}</option>
          ))}
        </select>
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${
          !selectedPrice || selectedPrice === 'all' ? 'text-gray-500' : 'text-white'
        }`} />
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="h-12 px-4 rounded-lg text-sm font-medium text-red-500 border border-red-500 hover:bg-red-50 transition-all duration-200 lg:flex-[0.4] whitespace-nowrap animate-fade-in"
        >
          Clear
        </button>
      )}
    </div>
  );
}


