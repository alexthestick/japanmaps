import { useState, useMemo } from 'react';
import type { Store } from '../../types/store';

interface DuplicateDetectorProps {
  stores: Store[];
}

/** Strip full-width chars, kana variations, punctuation, and lowercase for comparison */
function normalize(name: string): string {
  return name
    // Full-width → ASCII
    .replace(/[！-～]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    // Katakana → Hiragana
    .replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    // Strip common noise characters
    .replace(/[\s\-_.,·・　'"''""（）()【】「」『』〔〕]/g, '')
    .toLowerCase();
}

interface DuplicateGroup {
  key: string;
  stores: Store[];
}

function findDuplicates(stores: Store[]): DuplicateGroup[] {
  const map = new Map<string, Store[]>();

  stores.forEach(store => {
    const key = normalize(store.name);
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(store);
  });

  const groups: DuplicateGroup[] = [];
  map.forEach((group, key) => {
    if (group.length > 1) {
      groups.push({ key, stores: group });
    }
  });

  // Sort by group size descending
  groups.sort((a, b) => b.stores.length - a.stores.length);
  return groups;
}

/** Levenshtein distance for fuzzy matching */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function findFuzzyDuplicates(stores: Store[], threshold = 2): DuplicateGroup[] {
  const normalized = stores.map(s => ({ store: s, key: normalize(s.name) }));
  const visited = new Set<string>();
  const groups: DuplicateGroup[] = [];

  for (let i = 0; i < normalized.length; i++) {
    if (visited.has(normalized[i].store.id)) continue;
    const group: Store[] = [normalized[i].store];

    for (let j = i + 1; j < normalized.length; j++) {
      if (visited.has(normalized[j].store.id)) continue;
      const a = normalized[i].key;
      const b = normalized[j].key;
      if (Math.abs(a.length - b.length) > threshold) continue;
      const dist = levenshtein(a, b);
      if (dist > 0 && dist <= threshold) {
        group.push(normalized[j].store);
        visited.add(normalized[j].store.id);
      }
    }

    if (group.length > 1) {
      visited.add(normalized[i].store.id);
      groups.push({ key: normalized[i].key, stores: group });
    }
  }

  return groups.sort((a, b) => b.stores.length - a.stores.length);
}

function StoreRow({ store }: { store: Store }) {
  return (
    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50 text-sm">
      <div className="font-semibold text-gray-900">{store.name}</div>
      <div className="text-gray-500 text-xs mt-0.5">
        {store.city}{store.neighborhood ? ` · ${store.neighborhood}` : ''} · {store.address}
      </div>
      <div className="text-gray-400 text-xs mt-0.5">
        ID: {store.id.slice(0, 8)}…
        {store.photos?.length ? ` · ${store.photos.length} photo${store.photos.length > 1 ? 's' : ''}` : ' · no photos'}
        {store.mainCategory ? ` · ${store.mainCategory}` : ''}
      </div>
    </div>
  );
}

export function DuplicateDetector({ stores }: DuplicateDetectorProps) {
  const [mode, setMode] = useState<'exact' | 'fuzzy'>('exact');
  const [cityFilter, setCityFilter] = useState('');
  const [hasRun, setHasRun] = useState(false);

  const cities = useMemo(() => {
    const s = new Set<string>();
    stores.forEach(st => { if (st.city) s.add(st.city); });
    return Array.from(s).sort();
  }, [stores]);

  const filteredStores = useMemo(() => {
    if (!cityFilter) return stores;
    return stores.filter(s => s.city === cityFilter);
  }, [stores, cityFilter]);

  const duplicates = useMemo(() => {
    if (!hasRun) return [];
    return mode === 'exact' ? findDuplicates(filteredStores) : findFuzzyDuplicates(filteredStores);
  }, [hasRun, mode, filteredStores]);

  const handleRun = () => {
    setHasRun(false);
    // Defer to next tick so the UI re-renders the "running" state
    setTimeout(() => setHasRun(true), 50);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Duplicate Store Detector</h2>
        <p className="text-sm text-gray-500 mb-5">
          Finds stores with identical or similar names. Useful for catching stores entered twice. All matching is Unicode-aware (normalizes full-width Japanese, katakana/hiragana, punctuation).
        </p>

        <div className="flex flex-wrap gap-4 items-end">
          {/* Mode */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Match mode</label>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => { setMode('exact'); setHasRun(false); }}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${mode === 'exact' ? 'bg-white shadow font-semibold text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Exact
              </button>
              <button
                onClick={() => { setMode('fuzzy'); setHasRun(false); }}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${mode === 'fuzzy' ? 'bg-white shadow font-semibold text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Fuzzy (≤2 edits)
              </button>
            </div>
          </div>

          {/* City filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
            <select
              value={cityFilter}
              onChange={e => { setCityFilter(e.target.value); setHasRun(false); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">All cities ({stores.length} stores)</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Run button */}
          <button
            onClick={handleRun}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            Run Detector
          </button>
        </div>

        {/* Mode explanation */}
        <p className="text-xs text-gray-400 mt-4">
          {mode === 'exact'
            ? 'Exact mode: after stripping punctuation, spaces, and normalizing Unicode, names must match character-for-character.'
            : 'Fuzzy mode: names within 2 character edits (insertions, deletions, substitutions) of each other. Slower on large datasets.'}
          {mode === 'fuzzy' && filteredStores.length > 500 && (
            <span className="text-orange-500 font-medium"> Warning: fuzzy matching {filteredStores.length} stores may take a moment.</span>
          )}
        </p>
      </div>

      {/* Results */}
      {hasRun && (
        <div>
          {duplicates.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-semibold text-green-800">No duplicates found</div>
              <div className="text-sm text-green-600 mt-1">
                {mode === 'exact' ? 'All store names are unique after normalization.' : 'No names within 2 edits of each other.'}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  {duplicates.length} duplicate group{duplicates.length > 1 ? 's' : ''} found
                </h3>
                <span className="text-xs text-gray-400">
                  {duplicates.reduce((acc, g) => acc + g.stores.length, 0)} total stores affected
                </span>
              </div>

              {duplicates.map((group, gi) => (
                <div key={gi} className="bg-white border border-orange-200 rounded-xl overflow-hidden">
                  <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                      Possible duplicate · {group.stores.length} stores
                    </span>
                    <span className="text-xs text-gray-400 font-mono">key: {group.key}</span>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.stores.map(store => (
                      <StoreRow key={store.id} store={store} />
                    ))}
                  </div>
                  <div className="border-t border-gray-100 px-4 py-2 bg-gray-50 text-xs text-gray-500">
                    To resolve: keep the more complete entry and delete the duplicate from the Stores tab.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasRun && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          Configure your filters above and click <strong className="text-gray-600">Run Detector</strong> to scan for duplicates.
        </div>
      )}
    </div>
  );
}
