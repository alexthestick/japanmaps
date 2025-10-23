import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function DiagnosticPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStores() {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('id, name, main_category, categories')
          .or('name.ilike.%3pm%,name.ilike.%baggage%,name.ilike.%bridge%')
          .limit(20);

        if (error) throw error;
        setStores(data || []);
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Store Diagnostic Tool</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Main Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categories (Subcategories)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stores.map((store) => (
              <tr key={store.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {store.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded text-white ${
                    store.main_category === 'Food' ? 'bg-blue-500' :
                    store.main_category === 'Coffee' ? 'bg-brown-600' :
                    store.main_category === 'Fashion' ? 'bg-amber-500' :
                    'bg-gray-400'
                  }`}>
                    {store.main_category || 'NULL'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {store.categories?.join(', ') || 'None'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">What to check:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Does "3pm TOKYO" have main_category = "Food"?</li>
          <li>Does it have categories = ["Burger", "Western"]?</li>
          <li>If main_category is NULL or "Fashion", that's the problem!</li>
        </ul>
      </div>
    </div>
  );
}


