import { useState, useMemo } from 'react';
import type { Store } from '../../types/store';

interface DataQualityTabProps {
  stores: Store[];
  initialFilter?: string;
}

type QualityFilter = 'no-photos' | 'no-description' | 'no-neighborhood' | 'no-hours' | 'critical' | 'all';

function scoreStore(store: Store): number {
  let score = 0;
  if (store.photos && store.photos.length > 0) score++;
  if (store.description && store.description.trim().length > 0) score++;
  if (store.neighborhood && store.neighborhood.trim().length > 0) score++;
  if (store.hours && store.hours.trim().length > 0) score++;
  if (store.website && store.website.trim().length > 0) score++;
  return score;
}

const SCORE_COLORS = ['bg-red-500', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-600'];

function ScoreDots({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i < score ? SCORE_COLORS[score] : 'bg-gray-200'}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{score}/5</span>
    </div>
  );
}

const FILTER_OPTIONS: { value: QualityFilter; label: string; description: string }[] = [
  { value: 'no-photos', label: '🖼️ No Photos', description: 'Stores with zero photos' },
  { value: 'no-description', label: '📝 No Description', description: 'Stores missing a description' },
  { value: 'no-neighborhood', label: '📍 No Neighborhood', description: 'Stores without a neighborhood tag' },
  { value: 'no-hours', label: '🕐 No Hours', description: 'Stores missing opening hours' },
  { value: 'critical', label: '🚨 Critical (≤2/5)', description: 'Stores scoring 2 or below' },
  { value: 'all', label: '📋 All Stores', description: 'Show everything, sorted by score' },
];

export function DataQualityTab({ stores, initialFilter = 'critical' }: DataQualityTabProps) {
  const [activeFilter, setActiveFilter] = useState<QualityFilter>(initialFilter as QualityFilter);
  const [cityFilter, setCityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const cities = useMemo(() => {
    const s = new Set<string>();
    stores.forEach(st => { if (st.city) s.add(st.city); });
    return Array.from(s).sort();
  }, [stores]);

  const filtered = useMemo(() => {
    let result = [...stores];

    switch (activeFilter) {
      case 'no-photos':
        result = result.filter(s => !s.photos || s.photos.length === 0);
        break;
      case 'no-description':
        result = result.filter(s => !s.description || s.description.trim().length === 0);
        break;
      case 'no-neighborhood':
        result = result.filter(s => !s.neighborhood || s.neighborhood.trim().length === 0);
        break;
      case 'no-hours':
        result = result.filter(s => !s.hours || s.hours.trim().length === 0);
        break;
      case 'critical':
        result = result.filter(s => scoreStore(s) <= 2);
        break;
      case 'all':
      default:
        break;
    }

    if (cityFilter) {
      result = result.filter(s => s.city === cityFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.city ?? '').toLowerCase().includes(q) ||
        (s.neighborhood ?? '').toLowerCase().includes(q)
      );
    }

    // Sort by score ascending (worst first), then name
    result.sort((a, b) => {
      const diff = scoreStore(a) - scoreStore(b);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [stores, activeFilter, cityFilter, searchQuery]);

  // Reset page when filters change
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleFilterChange = (f: QualityFilter) => {
    setActiveFilter(f);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleFilterChange(opt.value)}
            title={opt.description}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === opt.value
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Secondary filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name, city, neighborhood…"
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
        />
        <select
          value={cityFilter}
          onChange={e => { setCityFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All cities</option>
          {cities.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="self-center text-sm text-gray-500">
          {filtered.length.toLocaleString()} stores
        </span>
      </div>

      {/* Store list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {paged.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">No stores match this filter.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Store</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">City</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Neighborhood</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Score</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Missing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.map(store => {
                const score = scoreStore(store);
                const missing: string[] = [];
                if (!store.photos || store.photos.length === 0) missing.push('photos');
                if (!store.description?.trim()) missing.push('description');
                if (!store.neighborhood?.trim()) missing.push('neighborhood');
                if (!store.hours?.trim()) missing.push('hours');
                if (!store.website?.trim()) missing.push('website');

                return (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 truncate max-w-[200px]">{store.name}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">{store.mainCategory}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{store.city}</td>
                    <td className="px-4 py-3 text-gray-500">{store.neighborhood || <span className="text-red-400">—</span>}</td>
                    <td className="px-4 py-3">
                      <ScoreDots score={score} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {missing.map(m => (
                          <span key={m} className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-xs font-medium">{m}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages} · {filtered.length} stores
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
