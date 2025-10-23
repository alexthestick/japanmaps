import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader } from '../components/common/Loader';
import { PhotoLightbox } from '../components/common/PhotoLightbox';
import { MapPin, ExternalLink, Instagram, Clock, Navigation, ArrowLeft, ShoppingBag, Globe, Heart } from 'lucide-react';
import { Button } from '../components/common/Button';
import { SaveButton } from '../components/store/SaveButton';
import type { Store } from '../types/store';
import { getGoogleMapsUrl } from '../utils/formatters';
import { parseLocation } from '../utils/helpers';

export function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStore(id);
    }
  }, [id]);

  async function fetchStore(storeId: string) {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();

      if (fetchError) throw fetchError;

      const { latitude, longitude } = parseLocation((data as any).location);

      const storeData = data as any;
      
      const transformedStore: Store = {
        id: storeData.id,
        name: storeData.name,
        address: storeData.address,
        city: storeData.city,
        neighborhood: storeData.neighborhood || undefined,
        country: storeData.country,
        latitude,
        longitude,
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
        haulCount: storeData.haul_count,
        saveCount: storeData.save_count,
      };

      setStore(transformedStore);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Loader message="Loading store..." />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Store Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || 'The store you\'re looking for doesn\'t exist.'}
          </p>
          <Button onClick={() => navigate('/')}>Back to Map</Button>
        </div>
      </div>
    );
  }

  const photos = store.photos && store.photos.length > 0
    ? store.photos
    : ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop'];

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button - Fixed */}
      <button
        onClick={() => {
          // Prefer going back if history exists and came from our app
          if (location.key !== 'default') {
            navigate(-1);
          } else {
            // Fallback to map with preserved params if provided in state
            const state = location.state as any;
            const params = new URLSearchParams(state?.params || {});
            const fallback = `/map${params.toString() ? `?${params.toString()}` : ''}`;
            navigate(fallback);
          }
        }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full shadow-lg hover:bg-white transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back</span>
      </button>

      {/* Airbnb-Style Image Gallery */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-8">
        {photos.length === 1 ? (
          /* Single Image */
          <div className="relative h-[400px] rounded-xl overflow-hidden">
            <img
              src={photos[0]}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : photos.length === 2 ? (
          /* Two Images - Side by Side */
          <div className="grid grid-cols-2 gap-2 h-[400px] rounded-xl overflow-hidden">
            {photos.slice(0, 2).map((photo, index) => (
              <div key={index} className="relative h-full cursor-pointer group">
                <img
                  src={photo}
                  alt={`${store.name} - ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onClick={() => setCurrentImageIndex(index)}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Airbnb Layout - 1 Large + 4 Small Grid */
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-xl overflow-hidden">
            {/* Large Main Image - Takes up 2x2 grid */}
            <div
              className="col-span-2 row-span-2 relative cursor-pointer group"
              onClick={() => {
                setCurrentImageIndex(0);
                setLightboxOpen(true);
              }}
            >
              <img
                src={photos[0]}
                alt={store.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>

            {/* Four Smaller Images */}
            {photos.slice(1, 5).map((photo, index) => (
              <div
                key={index + 1}
                className="relative cursor-pointer group"
                onClick={() => {
                  setCurrentImageIndex(index + 1);
                  setLightboxOpen(true);
                }}
              >
                <img
                  src={photo}
                  alt={`${store.name} - ${index + 2}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {/* Show +X more on last image if there are more photos */}
                {index === 3 && photos.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-semibold pointer-events-none">
                    +{photos.length - 5} more
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Store Name & Info Below Images */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {store.name}
            </h1>
            {store.verified && (
              <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                Verified
              </span>
            )}
          </div>
          <p className="text-lg text-gray-600">
            {store.neighborhood ? `${store.neighborhood}, ` : ''}{store.city}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {store.description && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {store.description}
                </p>
              </div>
            )}

            {/* Categories */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {store.mainCategory && (
                  <span className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full">
                    {store.mainCategory}
                  </span>
                )}
                {store.categories.map((category) => (
                  <span
                    key={category}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Map */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(store.address)}`}
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Heart className="w-5 h-5" />
                  <span>Saves</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{store.saveCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Hauls</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{store.haulCount}</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Information</h3>

              {/* Address */}
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Address</p>
                  <p className="text-sm text-gray-600">{store.address}</p>
                  <a
                    href={getGoogleMapsUrl(store.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mt-1"
                  >
                    Get Directions
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Hours */}
              {store.hours && (
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Hours</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{store.hours}</p>
                  </div>
                </div>
              )}

              {/* Price Range */}
              {store.priceRange && (
                <div className="flex gap-3">
                  <span className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1 text-center">¥</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Price Range</p>
                    <p className="text-sm text-gray-600">{store.priceRange}</p>
                  </div>
                </div>
              )}

              {/* Website */}
              {store.website && (
                <div className="flex gap-3">
                  <Globe className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Website</p>
                    <a
                      href={store.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      Visit Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Instagram */}
              {store.instagram && (
                <div className="flex gap-3">
                  <Instagram className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Instagram</p>
                    <a
                      href={`https://instagram.com/${store.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      {store.instagram}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <SaveButton storeId={store.id} variant="button" className="w-full" />
              <button className="w-full px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Add to Haul
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Lightbox */}
      {lightboxOpen && (
        <PhotoLightbox
          photos={photos}
          currentIndex={currentImageIndex}
          storeName={store.name}
          onClose={() => setLightboxOpen(false)}
          onNext={() => setCurrentImageIndex((i) => (i === photos.length - 1 ? 0 : i + 1))}
          onPrevious={() => setCurrentImageIndex((i) => (i === 0 ? photos.length - 1 : i - 1))}
        />
      )}
    </div>
  );
}

