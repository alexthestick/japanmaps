import { StoreCard } from './StoreCard';
import type { Store } from '../../types/store';

interface StoreListProps {
  stores: Store[];
  onStoreClick: (store: Store) => void;
}

export function StoreList({ stores, onStoreClick }: StoreListProps) {
  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No stores found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-6`}>
        {stores.map(store => (
          <StoreCard
            key={store.id}
            store={store}
            onClick={() => onStoreClick(store)}
          />
        ))}
      </div>
    </div>
  );
}


