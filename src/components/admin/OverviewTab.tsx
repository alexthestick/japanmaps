import { useMemo } from 'react';
import type { Store, StoreSuggestion } from '../../types/store';

interface OverviewTabProps {
  stores: Store[];
  suggestions: StoreSuggestion[];
  pendingFinds: any[];
  onNavigate: (tab: string, filter?: string) => void;
}

function scoreStore(store: Store): number {
  let score = 0;
  if (store.photos && store.photos.length > 0) score++;
  if (store.description && store.description.trim().length > 0) score++;
  if (store.neighborhood && store.neighborhood.trim().length > 0) score++;
  if (store.hours && store.hours.trim().length > 0) score++;
  if (store.website && store.website.trim().length > 0) score++;
  return score;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

interface StatCardProps {
  value: number | string;
  label: string;
  sub?: string;
  color?: string;
  onClick?: () => void;
  urgent?: boolean;
}

function StatCard({ value, label, sub, color = 'blue', onClick, urgent }: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-500',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    cyan: 'text-cyan-600',
  };
  const borderMap: Record<string, string> = {
    blue: 'border-blue-200',
    green: 'border-green-200',
    purple: 'border-purple-200',
    orange: 'border-orange-200',
    red: 'border-red-300',
    yellow: 'border-yellow-200',
    cyan: 'border-cyan-200',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border-2 ${borderMap[color] ?? 'border-gray-200'} p-5 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${urgent ? 'ring-2 ring-red-300' : ''}`}
    >
      <div className={`text-3xl font-bold ${colorMap[color] ?? 'text-gray-800'} mb-1`}>{value}</div>
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export function OverviewTab({ stores, suggestions, pendingFinds, onNavigate }: OverviewTabProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = daysAgo(7);
    const oneMonthAgo = daysAgo(30);

    const addedThisWeek = stores.filter(s => new Date(s.createdAt) >= oneWeekAgo).length;
    const addedThisMonth = stores.filter(s => new Date(s.createdAt) >= oneMonthAgo).length;
    const pendingSuggestionsCount = suggestions.filter(s => s.status === 'pending').length;
    const pendingFindsCount = pendingFinds.filter(f => f.status === 'pending').length;

    return { addedThisWeek, addedThisMonth, pendingSuggestionsCount, pendingFindsCount, now };
  }, [stores, suggestions, pendingFinds]);

  const dataHealth = useMemo(() => {
    const noPhotos = stores.filter(s => !s.photos || s.photos.length === 0);
    const noDescription = stores.filter(s => !s.description || s.description.trim().length === 0);
    const noNeighborhood = stores.filter(s => !s.neighborhood || s.neighborhood.trim().length === 0);
    const noHours = stores.filter(s => !s.hours || s.hours.trim().length === 0);
    const criticalStores = stores.filter(s => scoreStore(s) <= 2);

    return { noPhotos, noDescription, noNeighborhood, noHours, criticalStores };
  }, [stores]);

  const completenessDistribution = useMemo(() => {
    const bands = [0, 0, 0, 0]; // [0-1, 2, 3-4, 5]
    stores.forEach(s => {
      const score = scoreStore(s);
      if (score <= 1) bands[0]++;
      else if (score === 2) bands[1]++;
      else if (score <= 4) bands[2]++;
      else bands[3]++;
    });
    return bands;
  }, [stores]);

  const cityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    stores.forEach(s => {
      const city = s.city || 'Unknown';
      counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [stores]);

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    stores.forEach(s => {
      const cat = s.mainCategory || 'Unknown';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [stores]);

  const maxCity = cityBreakdown[0]?.[1] ?? 1;
  const maxCat = categoryBreakdown[0]?.[1] ?? 1;
  const total = stores.length || 1;

  return (
    <div className="space-y-8">
      {/* ── Top stats ── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Database Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            value={stores.length.toLocaleString()}
            label="Total Stores"
            sub="across all cities"
            color="blue"
            onClick={() => onNavigate('stores')}
          />
          <StatCard
            value={stats.addedThisWeek}
            label="Added This Week"
            sub={`${stats.addedThisMonth} this month`}
            color="green"
          />
          <StatCard
            value={stats.pendingFindsCount}
            label="Pending Finds"
            sub="awaiting review"
            color="purple"
            urgent={stats.pendingFindsCount > 5}
            onClick={() => onNavigate('finds')}
          />
          <StatCard
            value={stats.pendingSuggestionsCount}
            label="Pending Suggestions"
            sub="store submissions"
            color="orange"
            urgent={stats.pendingSuggestionsCount > 10}
            onClick={() => onNavigate('suggestions')}
          />
        </div>
      </section>

      {/* ── Data health ── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Health</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            value={dataHealth.noPhotos.length}
            label="No Photos"
            sub={`${((dataHealth.noPhotos.length / total) * 100).toFixed(0)}% of stores`}
            color="red"
            urgent={dataHealth.noPhotos.length > 50}
            onClick={() => onNavigate('quality', 'no-photos')}
          />
          <StatCard
            value={dataHealth.noDescription.length}
            label="No Description"
            sub={`${((dataHealth.noDescription.length / total) * 100).toFixed(0)}% of stores`}
            color="orange"
            onClick={() => onNavigate('quality', 'no-description')}
          />
          <StatCard
            value={dataHealth.noNeighborhood.length}
            label="No Neighborhood"
            sub={`${((dataHealth.noNeighborhood.length / total) * 100).toFixed(0)}% of stores`}
            color="yellow"
            onClick={() => onNavigate('quality', 'no-neighborhood')}
          />
          <StatCard
            value={dataHealth.noHours.length}
            label="No Hours"
            sub={`${((dataHealth.noHours.length / total) * 100).toFixed(0)}% of stores`}
            color="yellow"
            onClick={() => onNavigate('quality', 'no-hours')}
          />
          <StatCard
            value={dataHealth.criticalStores.length}
            label="Critical (≤2/5)"
            sub="needs urgent attention"
            color="red"
            urgent={dataHealth.criticalStores.length > 20}
            onClick={() => onNavigate('quality', 'critical')}
          />
        </div>
      </section>

      {/* ── Completeness chart ── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Completeness Distribution</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-end gap-4 h-32">
            {[
              { label: 'Poor (0–1)', count: completenessDistribution[0], color: 'bg-red-400' },
              { label: 'Fair (2)', count: completenessDistribution[1], color: 'bg-orange-400' },
              { label: 'Good (3–4)', count: completenessDistribution[2], color: 'bg-yellow-400' },
              { label: 'Full (5)', count: completenessDistribution[3], color: 'bg-green-500' },
            ].map(({ label, count, color }) => {
              const pct = total > 0 ? (count / total) * 100 : 0;
              const barH = total > 0 ? Math.max((count / Math.max(...completenessDistribution)) * 100, 4) : 4;
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-700">{count}</span>
                  <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                    <div
                      className={`w-full rounded-t ${color}`}
                      style={{ height: `${barH}%` }}
                      title={`${count} stores (${pct.toFixed(1)}%)`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 text-center leading-tight">{label}</span>
                  <span className="text-xs text-gray-400">{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── City & Category breakdowns ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* City breakdown */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Stores by City</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            {cityBreakdown.map(([city, count]) => (
              <div key={city} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-28 shrink-0 truncate">{city}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(count / maxCity) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 w-10 text-right">{count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Category breakdown */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Stores by Category</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            {categoryBreakdown.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-28 shrink-0 truncate">{cat}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${(count / maxCat) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 w-10 text-right">{count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Quick actions ── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            {
              label: '🖼️ Fix stores missing photos',
              sub: `${dataHealth.noPhotos.length} stores`,
              action: () => onNavigate('quality', 'no-photos'),
            },
            {
              label: '📝 Add descriptions',
              sub: `${dataHealth.noDescription.length} stores`,
              action: () => onNavigate('quality', 'no-description'),
            },
            {
              label: '📍 Fill in neighborhoods',
              sub: `${dataHealth.noNeighborhood.length} stores`,
              action: () => onNavigate('quality', 'no-neighborhood'),
            },
            {
              label: '🔍 Find duplicate stores',
              sub: 'Run duplicate detector',
              action: () => onNavigate('duplicates'),
            },
            {
              label: '✅ Review pending finds',
              sub: `${stats.pendingFindsCount} waiting`,
              action: () => onNavigate('finds'),
            },
            {
              label: '💡 Review suggestions',
              sub: `${stats.pendingSuggestionsCount} pending`,
              action: () => onNavigate('suggestions'),
            },
          ].map(({ label, sub, action }) => (
            <button
              key={label}
              onClick={action}
              className="text-left bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 transition-colors"
            >
              <div className="font-medium text-gray-800 text-sm">{label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
