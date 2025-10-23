import { useState } from 'react';
import { Pencil, Trash2, Search } from 'lucide-react';
import type { Store } from '../../types/store';
import { Button } from '../common/Button';

interface StoreListTableProps {
  stores: Store[];
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
}

export function StoreListTable({ stores, onEdit, onDelete }: StoreListTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'city' | 'created' | 'updated'>('name');

  const filteredStores = stores.filter(store => {
    const query = searchQuery.toLowerCase();
    return (
      store.name.toLowerCase().includes(query) ||
      store.city.toLowerCase().includes(query) ||
      store.neighborhood?.toLowerCase().includes(query) ||
      store.address.toLowerCase().includes(query)
    );
  });

  const sortedStores = [...filteredStores].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'city') return a.city.localeCompare(b.city);
    if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'updated') {
      // Sort by most recently updated first
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    }
    return 0;
  });

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header with search and sort */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search stores by name, city, or neighborhood..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="city">Sort by City</option>
            <option value="created">Sort by Date Added</option>
            <option value="updated">Sort by Recently Edited</option>
          </select>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Showing {sortedStores.length} of {stores.length} stores
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Store Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Categories
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Info Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedStores.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No stores found
                </td>
              </tr>
            ) : (
              sortedStores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{store.name}</p>
                      {store.instagram && (
                        <p className="text-sm text-gray-500">{store.instagram}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-900">{store.city}</p>
                      {store.neighborhood && (
                        <p className="text-sm text-gray-500">{store.neighborhood}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {store.categories.slice(0, 2).map((category) => (
                        <span
                          key={category}
                          className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full capitalize"
                        >
                          {category}
                        </span>
                      ))}
                      {store.categories.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{store.categories.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-xs ${store.photos.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {store.photos.length > 0 ? `✓ ${store.photos.length} photo(s)` : '✗ No photos'}
                      </span>
                      <span className={`text-xs ${store.website ? 'text-green-600' : 'text-gray-400'}`}>
                        {store.website ? '✓ Website' : '✗ No website'}
                      </span>
                      <span className={`text-xs ${store.description ? 'text-green-600' : 'text-gray-400'}`}>
                        {store.description ? '✓ Description' : '✗ No description'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(store)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit store"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(store)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete store"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
