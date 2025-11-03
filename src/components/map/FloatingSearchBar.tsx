import { Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { SearchAutocomplete, type SearchSuggestion } from '../store/SearchAutocomplete';
import type { Store } from '../../types/store';

interface FloatingSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  stores: Store[];
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;
}

export function FloatingSearchBar({
  value,
  onChange,
  placeholder = "Search stores, neighborhoods...",
  stores,
  onSelectSuggestion
}: FloatingSearchBarProps) {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

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
      onChange(suggestion.name);
    } else {
      onChange(''); // Clear search when selecting location
    }
  };

  const handleClearSearch = () => {
    onChange('');
    setShowAutocomplete(false);
    inputRef.current?.focus();
  };

  return (
    <div className="absolute top-5 left-5 z-20" ref={containerRef}>
      <div className="relative w-[340px] bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-xl border-2 border-cyan-400/50 px-5 py-4 hover:shadow-2xl hover:border-cyan-400/80 transition-all"
           style={{ boxShadow: '0 0 30px rgba(34, 217, 238, 0.3)' }}>
        {/* Film grain */}
        <div className="absolute inset-0 film-grain opacity-10 rounded-2xl pointer-events-none" />

        <div className="relative flex items-center gap-3">
          <Search className="w-6 h-6 text-cyan-300 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => {
              if (value.length >= 2) setShowAutocomplete(true);
            }}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-base font-medium"
            autoComplete="off"
          />
          {value && (
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
        {showAutocomplete && value.length >= 2 && (
          <div className="relative">
            <SearchAutocomplete
              query={value}
              stores={stores}
              onSelect={handleSelectSuggestion}
              onClose={() => setShowAutocomplete(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
