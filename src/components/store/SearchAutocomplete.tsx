import { useState, useEffect, useMemo } from 'react';
import { MapPin, Map as MapIcon } from 'lucide-react';
import type { Store } from '../../types/store';

export interface SearchSuggestion {
  type: 'store' | 'location';
  name: string;
  subtitle?: string;
  storeId?: string;
  city?: string;
  neighborhood?: string;
}

interface SearchAutocompleteProps {
  query: string;
  stores: Store[];
  onSelect: (suggestion: SearchSuggestion) => void;
  onClose: () => void;
}

export function SearchAutocomplete({ query, stores, onSelect, onClose }: SearchAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Generate suggestions from stores
  const suggestions = useMemo(() => {
    if (query.length < 2) return [];

    const lowerQuery = query.toLowerCase();

    // ── 1. Collect unique area matches (neighborhoods + cities) ──────────
    // Areas go FIRST so typing "harajuku" / "osaka" / "kyoto" immediately
    // surfaces the fly-to-area action before individual store results.
    const locationMap = new Map<string, SearchSuggestion>();

    stores.forEach(store => {
      // Neighborhood match — dedup key is "neighborhood|city" so
      // "Osaka, Osaka" (where neighborhood === city) doesn't appear twice.
      if (
        store.neighborhood?.toLowerCase().includes(lowerQuery) &&
        store.neighborhood.toLowerCase() !== store.city.toLowerCase() // skip same-name dedup
      ) {
        const key = `${store.neighborhood.toLowerCase()}|${store.city.toLowerCase()}`;
        if (!locationMap.has(key)) {
          locationMap.set(key, {
            type: 'location',
            name: store.neighborhood,
            subtitle: store.city,
            city: store.city,
            neighborhood: store.neighborhood,
          });
        }
      }

      // City match — one entry per city, subtitle "City"
      if (store.city.toLowerCase().includes(lowerQuery)) {
        const key = `city|${store.city.toLowerCase()}`;
        if (!locationMap.has(key)) {
          locationMap.set(key, {
            type: 'location',
            name: store.city,
            subtitle: 'City',
            city: store.city,
          });
        }
      }
    });

    // Sort areas: exact/starts-with matches before contains matches
    const uniqueLocations = Array.from(locationMap.values())
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
        const bStarts = b.name.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
        return aStarts - bStarts;
      })
      .slice(0, 3); // max 3 area results

    // ── 2. Store matches ─────────────────────────────────────────────────
    // Only show stores whose NAME matches — city/neighborhood matches are
    // already covered by the area results above, so we avoid flooding the
    // list with every store in Osaka when the user types "osaka".
    const matchingStores = stores
      .filter(store => store.name.toLowerCase().includes(lowerQuery))
      .slice(0, 5);

    const storeResults: SearchSuggestion[] = matchingStores.map(store => ({
      type: 'store',
      name: store.name,
      subtitle: store.neighborhood
        ? `${store.neighborhood}, ${store.city}`
        : store.city,
      storeId: store.id,
      city: store.city,
      neighborhood: store.neighborhood,
    }));

    // Areas first, then stores — max 8 total
    return [...uniqueLocations, ...storeResults].slice(0, 8);
  }, [query, stores]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % suggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            onSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
        case 'Tab':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [suggestions, selectedIndex, onSelect, onClose]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  // Don't render if no suggestions
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-[100] bg-white shadow-2xl rounded-lg max-h-[60vh] overflow-y-auto border-0 divide-y divide-gray-100">
      {suggestions.map((suggestion, index) => (
        <button
          key={`${suggestion.type}-${suggestion.name}-${index}`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent backdrop click
            onSelect(suggestion);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors first:rounded-t-lg last:rounded-b-lg active:scale-[0.98] ${
            index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
          }`}
        >
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            suggestion.type === 'store' ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            {suggestion.type === 'store' ? (
              <MapPin className="w-5 h-5 text-blue-600" />
            ) : (
              <MapIcon className="w-5 h-5 text-green-600" />
            )}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate text-[15px]">
              {suggestion.name}
            </div>
            {suggestion.subtitle && (
              <div className="text-sm text-gray-500 truncate mt-0.5">
                {suggestion.subtitle}
              </div>
            )}
          </div>

          {/* Type badge */}
          <div className="flex-shrink-0">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              suggestion.type === 'store'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {suggestion.type === 'store' ? 'Store' : 'Area'}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

