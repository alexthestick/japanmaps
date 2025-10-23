import { useState } from 'react';
import type { StoreFilters, StoreCategory, PriceRange } from '../types/store';

export function useFilters() {
  const [filters, setFilters] = useState<StoreFilters>({
    countries: [],
    cities: [],
    categories: [],
    priceRanges: [],
    verified: undefined,
    searchQuery: '',
  });

  const updateFilter = (key: keyof StoreFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (category: StoreCategory) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const togglePriceRange = (priceRange: PriceRange) => {
    setFilters(prev => ({
      ...prev,
      priceRanges: prev.priceRanges.includes(priceRange)
        ? prev.priceRanges.filter(p => p !== priceRange)
        : [...prev.priceRanges, priceRange],
    }));
  };

  const clearFilters = () => {
    setFilters({
      countries: [],
      cities: [],
      categories: [],
      priceRanges: [],
      verified: undefined,
      searchQuery: '',
    });
  };

  return {
    filters,
    updateFilter,
    toggleCategory,
    togglePriceRange,
    clearFilters,
  };
}


