import { useState } from 'react';
import { MapView } from '../components/map/MapView';
import { StoreList } from '../components/store/StoreList';
import { StoreFilters } from '../components/store/StoreFilters';
import { StoreDetail } from '../components/store/StoreDetail';
import { useStores } from '../hooks/useStores';
import { Loader } from '../components/common/Loader';
import { Map, List } from 'lucide-react';
import type { Store, StoreFilters as Filters } from '../types/store';
import type { SearchSuggestion } from '../components/store/SearchAutocomplete';
import { sortStores } from '../utils/helpers';

export function HomePage() {
  const [view, setView] = useState<'map' | 'list'>('map');
  const [filters, setFilters] = useState<Filters>({
    countries: [],
    cities: [],
    categories: [],
    priceRanges: [],
  });
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [sortBy, setSortBy] = useState<string>('name');

  const { stores, loading, error } = useStores(filters);
  const sortedStores = sortStores(stores, sortBy);

  // Handle autocomplete suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'store' && suggestion.storeId) {
      // Find the store and open its detail panel
      const store = stores.find(s => s.id === suggestion.storeId);
      if (store) {
        setSelectedStore(store);
      }
    }
    // Note: Location suggestions are already handled by filter changes in StoreFilters
    // The auto-zoom will happen automatically via MapView's useEffect
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader message="Loading stores..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Stores</h2>
          <p className="text-gray-600">{error.message}</p>
          <p className="text-sm text-gray-500 mt-4">
            Make sure Supabase is configured correctly in your .env.local file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header with view toggle and store count */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Store count */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Discover Stores</h1>
            <p className="text-sm text-gray-600 mt-1">
              {sortedStores.length} {sortedStores.length === 1 ? 'store' : 'stores'} found
            </p>
          </div>
          
          {/* Right: Map/List segmented control */}
          <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setView('map')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all duration-150 ${
                view === 'map'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all duration-150 ${
                view === 'list'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
          </div>
          
          {/* Mobile: Original button style */}
          <div className="flex md:hidden gap-2">
            <button
              onClick={() => setView('map')}
              className={`px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                view === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Map className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0 relative">
        <div className="max-w-7xl mx-auto">
          <StoreFilters 
            filters={filters} 
            onChange={setFilters}
            stores={stores}
            onSuggestionSelect={handleSuggestionSelect}
          />
        </div>
      </div>

      {/* Sort controls (only in list view) */}
      {view === 'list' && (
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name (A-Z)</option>
              <option value="city">City</option>
              <option value="recent">Recently Added</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden">
        {view === 'map' ? (
          <>
            <MapView 
              stores={sortedStores} 
              onStoreClick={setSelectedStore} 
              selectedCity={filters.selectedCity}
              isSearchActive={!!filters.searchQuery}
            />
            
            {/* Empty state overlay for map view */}
            {sortedStores.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white shadow-lg rounded-lg py-8 px-12 text-center pointer-events-auto">
                  <p className="text-lg text-gray-600 mb-2 font-medium">No stores found</p>
                  <p className="text-sm text-gray-500">Try adjusting your filters to see more results</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full overflow-y-auto">
            {sortedStores.length === 0 ? (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center py-12 px-4">
                  <p className="text-lg text-gray-600 mb-2 font-medium">No stores found</p>
                  <p className="text-sm text-gray-500">Try adjusting your filters to see more results</p>
                </div>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto p-4">
                <StoreList stores={sortedStores} onStoreClick={setSelectedStore} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Store detail modal */}
      {selectedStore && (
        <StoreDetail
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
        />
      )}
    </div>
  );
}


