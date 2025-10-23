import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { getAllNeighborhoodsWithStores } from '../../utils/neighborhoodData';

interface NeighborhoodCount {
  city: string;
  neighborhood: string | null;
  count: number;
}

export function NeighborhoodList() {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNeighborhoods() {
      const data = await getAllNeighborhoodsWithStores();
      setNeighborhoods(data);
      setLoading(false);
    }
    fetchNeighborhoods();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading neighborhoods...</div>;
  }

  // Group by city for better organization
  const groupedByCity: Record<string, NeighborhoodCount[]> = {};
  neighborhoods.forEach((item) => {
    if (!groupedByCity[item.city]) {
      groupedByCity[item.city] = [];
    }
    groupedByCity[item.city].push(item);
  });

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Neighborhoods Overview</h2>
            <p className="text-sm text-gray-600 mt-1">
              All neighborhoods with stores in the database
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{neighborhoods.length}</div>
            <div className="text-sm text-gray-600">Total locations</div>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedByCity)
            .sort(([cityA], [cityB]) => cityA.localeCompare(cityB))
            .map(([city, items]) => {
              const cityTotal = items.reduce((sum, item) => sum + item.count, 0);

              return (
                <div key={city} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{city}</h3>
                    <span className="text-sm font-medium text-gray-600">{cityTotal} stores total</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((item, index) => (
                      <div
                        key={`${item.city}-${item.neighborhood}-${index}`}
                        className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {item.neighborhood || 'City (No specific neighborhood)'}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="text-sm font-medium text-blue-900 mb-1">Total Cities</div>
          <div className="text-3xl font-bold text-blue-600">{Object.keys(groupedByCity).length}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="text-sm font-medium text-green-900 mb-1">Total Neighborhoods</div>
          <div className="text-3xl font-bold text-green-600">
            {neighborhoods.filter(n => n.neighborhood !== null).length}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="text-sm font-medium text-purple-900 mb-1">Total Stores</div>
          <div className="text-3xl font-bold text-purple-600">
            {neighborhoods.reduce((sum, n) => sum + n.count, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
