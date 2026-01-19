import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Trash2, Heart, ArrowLeft } from 'lucide-react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { supabase } from '../lib/supabase';
import { getSavedStores, clearAllSavedStores, unsaveStore } from '../utils/savedStores';
import { getGoogleMapsUrl } from '../utils/formatters';
import { MAPBOX_TOKEN, MAP_STYLE } from '../lib/mapbox';
import type { Store } from '../types/store';
import 'mapbox-gl/dist/mapbox-gl.css';

export function SavedStoresPage() {
  const navigate = useNavigate();
  const [savedStores, setSavedStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredStoreId, setHoveredStoreId] = useState<string | null>(null);
  const [viewState, setViewState] = useState({
    longitude: 139.6503,
    latitude: 35.6762,
    zoom: 12,
  });

  useEffect(() => {
    fetchSavedStores();

    // Listen for changes to saved stores
    const handleSavedStoresChanged = () => {
      fetchSavedStores();
    };

    window.addEventListener('savedStoresChanged', handleSavedStoresChanged);
    return () => window.removeEventListener('savedStoresChanged', handleSavedStoresChanged);
  }, []);

  async function fetchSavedStores() {
    setLoading(true);
    const savedStoreData = getSavedStores();
    const storeIds = savedStoreData.map(s => s.id);

    if (storeIds.length === 0) {
      setSavedStores([]);
      setLoading(false);
      return;
    }

    try {
      // Use the RPC function to get stores with parsed coordinates
      const { data: allStores, error } = await supabase.rpc('get_stores_with_coordinates');

      if (error) throw error;

      // Filter to only saved store IDs
      const transformedStores: Store[] = (allStores || [])
        .filter((store: any) => storeIds.includes(store.id))
        .map((storeData: any) => ({
          id: storeData.id,
          name: storeData.name,
          address: storeData.address,
          city: storeData.city,
          neighborhood: storeData.neighborhood || undefined,
          country: storeData.country,
          latitude: storeData.latitude,
          longitude: storeData.longitude,
          categories: storeData.categories as any,
          priceRange: storeData.price_range as any,
          description: storeData.description || undefined,
          photos: storeData.photos || [],
          website: storeData.website || undefined,
          instagram: storeData.instagram || undefined,
          hours: storeData.hours || undefined,
          verified: storeData.verified,
          submittedBy: storeData.submitted_by || undefined,
          createdAt: storeData.created_at,
          updatedAt: storeData.updated_at,
          haulCount: storeData.haul_count || 0,
          saveCount: storeData.save_count || 0,
          mainCategory: storeData.main_category || undefined,
        }));

      setSavedStores(transformedStores);

      // Center map on first store
      if (transformedStores.length > 0) {
        setViewState({
          longitude: transformedStores[0].longitude,
          latitude: transformedStores[0].latitude,
          zoom: 12,
        });
      }
    } catch (error) {
      console.error('Error fetching saved stores:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleUnsave = (storeId: string) => {
    unsaveStore(storeId);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all saved stores?')) {
      clearAllSavedStores();
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading your saved stores...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Saved Stores</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {savedStores.length} {savedStores.length === 1 ? 'store' : 'stores'} saved
                </p>
              </div>
            </div>

            {savedStores.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {savedStores.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <Heart className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No saved stores yet</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Start exploring and save your favorite stores to build your perfect shopping route
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Explore Stores
          </button>
        </div>
      ) : (
        /* Split View */
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Scrollable List */}
          <div className="w-full md:w-2/5 overflow-y-auto border-r border-gray-200">
            <div className="divide-y divide-gray-100">
              {savedStores.map((store) => {
                const isHovered = hoveredStoreId === store.id;
                const thumbnail = store.photos?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop';

                return (
                  <div
                    key={store.id}
                    className={`group relative transition-all ${
                      isHovered ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                    }`}
                    onMouseEnter={() => setHoveredStoreId(store.id)}
                    onMouseLeave={() => setHoveredStoreId(null)}
                  >
                    <div className="flex gap-4 p-4">
                      {/* Thumbnail - Enhanced with shadow and hover effect */}
                      <div
                        onClick={() => navigate(`/store/${store.slug || store.id}`)}
                        className="relative flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all"
                      >
                        <img
                          src={thumbnail}
                          alt={store.name}
                          className={`w-full h-full object-cover transition-all duration-300 ${
                            isHovered ? 'scale-110 brightness-95' : 'scale-100'
                          }`}
                        />
                        {/* Gradient overlay on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`} />
                        {store.verified && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                        )}
                      </div>

                      {/* Store Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => navigate(`/store/${store.slug || store.id}`)}
                          className="font-bold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors truncate"
                        >
                          {store.name}
                        </h3>

                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {store.neighborhood ? `${store.neighborhood}, ` : ''}{store.city}
                          </span>
                        </div>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {store.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {cat}
                            </span>
                          ))}
                          {store.categories.length > 2 && (
                            <span className="px-2 py-0.5 text-gray-500 text-xs">
                              +{store.categories.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Quick Actions - Visible on hover */}
                        <div className={`flex gap-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(getGoogleMapsUrl(store.address), '_blank');
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Navigation className="w-3 h-3" />
                            Directions
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnsave(store.id);
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Heart Icon */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleUnsave(store.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Map */}
          <div className="hidden md:block w-3/5 relative">
            <Map
              {...viewState}
              onMove={(evt) => setViewState(evt.viewState)}
              style={{ width: '100%', height: '100%' }}
              mapStyle={MAP_STYLE}
              mapboxAccessToken={MAPBOX_TOKEN}
            >
              <NavigationControl position="top-right" />

              {savedStores.map((store) => {
                const isHovered = hoveredStoreId === store.id;

                return (
                  <Marker
                    key={store.id}
                    longitude={store.longitude}
                    latitude={store.latitude}
                    anchor="bottom"
                    onClick={() => navigate(`/store/${store.slug || store.id}`)}
                  >
                    <div
                      className={`cursor-pointer transition-transform ${isHovered ? 'scale-125' : 'scale-100'}`}
                      style={{
                        animation: !isHovered ? 'pulse 2s ease-in-out infinite' : 'none',
                      }}
                    >
                      <svg width={isHovered ? "56" : "48"} height={isHovered ? "56" : "48"} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        {/* Outer glow for pulsing effect */}
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill={isHovered ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.2)'}
                          opacity={isHovered ? '1' : '0.6'}
                        />

                        {/* Heart shape */}
                        <path
                          d="M24 38 C24 38 10 28 10 18 C10 13 13 10 17 10 C20 10 22 11.5 24 14 C26 11.5 28 10 31 10 C35 10 38 13 38 18 C38 28 24 38 24 38 Z"
                          fill={isHovered ? '#EF4444' : '#DC2626'}
                          stroke="white"
                          strokeWidth="2"
                        />

                        {/* Inner sparkle */}
                        <circle cx="20" cy="18" r="2" fill="white" opacity="0.8"/>
                      </svg>
                    </div>
                  </Marker>
                );
              })}
            </Map>
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}
