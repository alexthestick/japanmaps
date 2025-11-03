import { useState } from 'react';
import { StoreCard } from './StoreCard';
import type { Store } from '../../types/store';

interface StoreListProps {
  stores: Store[];
  onStoreClick: (store: Store) => void;
}

/**
 * PHASE 3: Optimized StoreList with progressive loading
 * Initially renders 24 stores, user can load more
 * Prevents rendering 80+ cards at once for better performance
 */
export function StoreList({ stores, onStoreClick }: StoreListProps) {
  const INITIAL_LOAD = 24; // Load 24 stores initially (fits 3 rows on desktop)
  const LOAD_MORE_INCREMENT = 24; // Load 24 more each time

  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);

  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No stores found matching your filters.</p>
      </div>
    );
  }

  const visibleStores = stores.slice(0, visibleCount);
  const hasMore = visibleCount < stores.length;

  return (
    <div className="space-y-6">
      {/* Product Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-6`}>
        {visibleStores.map(store => (
          <StoreCard
            key={store.id}
            store={store}
            onClick={() => onStoreClick(store)}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center py-8">
          <button
            onClick={() => setVisibleCount(prev => Math.min(prev + LOAD_MORE_INCREMENT, stores.length))}
            className="relative px-8 py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg border-2 border-cyan-300/50 overflow-hidden"
            style={{ boxShadow: '0 0 30px rgba(34, 217, 238, 0.4)' }}
          >
            <div className="absolute inset-0 film-grain opacity-10" />
            <span className="relative">Load More ({stores.length - visibleCount} remaining)</span>
          </button>
        </div>
      )}
    </div>
  );
}


