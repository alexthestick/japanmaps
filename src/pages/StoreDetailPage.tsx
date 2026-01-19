import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader } from '../components/common/Loader';
import { PhotoLightbox } from '../components/common/PhotoLightbox';
import { MapPin, ExternalLink, Instagram, Clock, Navigation, ArrowLeft, ShoppingBag, Globe, Heart, Share2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { SaveButton } from '../components/store/SaveButton';
import { InstagramGeneratorModal } from '../components/store/InstagramGeneratorModal';
import type { Store } from '../types/store';
import { getGoogleMapsUrl } from '../utils/formatters';
import { parseLocation } from '../utils/helpers';
import { isUUID, generateSlug } from '../utils/slugify';

export function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [instagramModalOpen, setInstagramModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStore(id);
    }
  }, [id]);

  async function fetchStore(idOrSlug: string) {
    try {
      setLoading(true);

      // Determine if we're looking up by ID (UUID) or slug
      const lookupField = isUUID(idOrSlug) ? 'id' : 'slug';

      let query = supabase
        .from('stores')
        .select('*');

      if (lookupField === 'id') {
        query = query.eq('id', idOrSlug);
      } else {
        // Try slug first, fall back to generated slug match
        query = query.eq('slug', idOrSlug);
      }

      let { data, error: fetchError } = await query.single();

      // If slug lookup failed, try matching by generated slug from name
      if (fetchError && lookupField === 'slug') {
        const { data: allStores } = await supabase
          .from('stores')
          .select('*');

        if (allStores) {
          data = allStores.find((s: any) =>
            generateSlug(s.name, s.city) === idOrSlug
          );
          if (data) fetchError = null;
        }
      }

      if (fetchError || !data) throw fetchError || new Error('Store not found');

      const { latitude, longitude } = parseLocation((data as any).location);

      const storeData = data as any;

      const transformedStore: Store = {
        id: storeData.id,
        slug: storeData.slug || generateSlug(storeData.name, storeData.city),
        name: storeData.name,
        nameJapanese: storeData.name_japanese || undefined,
        address: storeData.address,
        city: storeData.city,
        neighborhood: storeData.neighborhood || undefined,
        country: storeData.country,
        latitude,
        longitude,
        mainCategory: storeData.main_category || undefined,
        category: storeData.category || (storeData.categories && storeData.categories[0]) || undefined,
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

      // If accessed via UUID and we have a slug, redirect to SEO-friendly URL
      if (isUUID(idOrSlug) && transformedStore.slug) {
        navigate(`/store/${transformedStore.slug}`, { replace: true });
      }
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Film Grain Overlay */}
      <div
        className="fixed inset-0 opacity-[0.15] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

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
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm text-cyan-300 rounded-full shadow-lg hover:bg-black/80 transition-all border border-cyan-500/30 hover:border-cyan-500/50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-bold">BACK</span>
      </button>

      {/* Hero Section with Breadcrumb */}
      <div className="relative z-10 pt-24 pb-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <button
              onClick={() => navigate('/cities')}
              className="text-gray-400 hover:text-cyan-300 transition-colors"
            >
              {store.city}
            </button>
            {store.neighborhood && (
              <>
                <span className="text-gray-600">/</span>
                <span className="text-gray-400">{store.neighborhood}</span>
              </>
            )}
            <span className="text-gray-600">/</span>
            <span className="text-cyan-300 font-bold">{store.name}</span>
          </div>

          {/* Store Title */}
          <div className="flex items-center gap-4 mb-3">
            <h1
              className="text-4xl md:text-6xl font-black italic uppercase tracking-tight"
              style={{
                textShadow: '0 0 30px rgba(34, 217, 238, 0.5), 0 0 60px rgba(34, 217, 238, 0.3)',
                color: '#22D9EE'
              }}
            >
              {store.name}
            </h1>
            {store.verified && (
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase rounded-full border border-cyan-500/30">
                Verified
              </span>
            )}
          </div>

          <p className="text-lg text-gray-400">
            {store.neighborhood ? `${store.neighborhood}, ` : ''}{store.city}
          </p>
        </div>
      </div>

      {/* Photo Gallery with Kirby Theme */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-8">
        {photos.length === 1 ? (
          /* Single Image */
          <div className="relative h-[400px] rounded-xl overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(34,217,238,0.2)]">
            <img
              src={photos[0]}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : photos.length === 2 ? (
          /* Two Images - Side by Side */
          <div className="grid grid-cols-2 gap-3 h-[400px]">
            {photos.slice(0, 2).map((photo, index) => (
              <div
                key={index}
                className="relative h-full cursor-pointer group rounded-xl overflow-hidden border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all shadow-[0_0_20px_rgba(34,217,238,0.2)] hover:shadow-[0_0_40px_rgba(34,217,238,0.4)]"
                onClick={() => {
                  setCurrentImageIndex(index);
                  setLightboxOpen(true);
                }}
              >
                <img
                  src={photo}
                  alt={`${store.name} - ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : (
          /* Airbnb Layout - 1 Large + 4 Small Grid */
          <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[400px]">
            {/* Large Main Image - Takes up 2x2 grid */}
            <div
              className="col-span-2 row-span-2 relative cursor-pointer group rounded-xl overflow-hidden border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all shadow-[0_0_20px_rgba(34,217,238,0.2)] hover:shadow-[0_0_40px_rgba(34,217,238,0.4)]"
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
                className="relative cursor-pointer group rounded-xl overflow-hidden border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all shadow-[0_0_20px_rgba(34,217,238,0.2)] hover:shadow-[0_0_40px_rgba(34,217,238,0.4)]"
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
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-cyan-300 text-xl font-bold italic pointer-events-none">
                    +{photos.length - 5} MORE
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {store.description && (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-cyan-500/20">
                <h2
                  className="text-2xl font-black italic uppercase mb-4"
                  style={{
                    color: '#22D9EE',
                    textShadow: '0 0 20px rgba(34, 217, 238, 0.3)'
                  }}
                >
                  ABOUT
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {store.description}
                </p>
              </div>
            )}

            {/* Categories */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-cyan-500/20">
              <h2
                className="text-2xl font-black italic uppercase mb-4"
                style={{
                  color: '#22D9EE',
                  textShadow: '0 0 20px rgba(34, 217, 238, 0.3)'
                }}
              >
                CATEGORIES
              </h2>
              <div className="flex flex-wrap gap-2">
                {store.mainCategory && (
                  <span className="px-4 py-2 bg-cyan-500/20 text-cyan-300 text-sm font-bold uppercase rounded-full border border-cyan-500/30">
                    {store.mainCategory}
                  </span>
                )}
                {store.categories.map((category) => (
                  <span
                    key={category}
                    className="px-4 py-2 bg-gray-700/50 text-gray-300 text-sm font-medium rounded-full border border-gray-600/30"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-cyan-500/20">
              <h2
                className="text-2xl font-black italic uppercase mb-4"
                style={{
                  color: '#22D9EE',
                  textShadow: '0 0 20px rgba(34, 217, 238, 0.3)'
                }}
              >
                LOCATION
              </h2>
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(34,217,238,0.2)]">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&q=${encodeURIComponent(store.address)}`}
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 space-y-4 border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Heart className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold uppercase">Saves</span>
                </div>
                <span
                  className="text-3xl font-black italic"
                  style={{
                    color: '#22D9EE',
                    textShadow: '0 0 20px rgba(34, 217, 238, 0.5)'
                  }}
                >
                  {store.saveCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <ShoppingBag className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold uppercase">Hauls</span>
                </div>
                <span
                  className="text-3xl font-black italic"
                  style={{
                    color: '#22D9EE',
                    textShadow: '0 0 20px rgba(34, 217, 238, 0.5)'
                  }}
                >
                  {store.haulCount}
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 space-y-4 border border-cyan-500/20">
              <h3
                className="text-lg font-black italic uppercase mb-2"
                style={{
                  color: '#22D9EE',
                  textShadow: '0 0 20px rgba(34, 217, 238, 0.3)'
                }}
              >
                INFORMATION
              </h3>

              {/* Address */}
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-bold text-gray-300 mb-1">Address</p>
                  <p className="text-sm text-gray-400">{store.address}</p>
                  <a
                    href={getGoogleMapsUrl(store.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 mt-1 font-medium"
                  >
                    Get Directions
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Hours */}
              {store.hours && (
                <div className="flex gap-3 pt-3 border-t border-gray-700/50">
                  <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-gray-300 mb-1">Hours</p>
                    <p className="text-sm text-gray-400 whitespace-pre-line">{store.hours}</p>
                  </div>
                </div>
              )}

              {/* Price Range */}
              {store.priceRange && (
                <div className="flex gap-3 pt-3 border-t border-gray-700/50">
                  <span className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1 text-center font-bold">¥</span>
                  <div>
                    <p className="text-sm font-bold text-gray-300 mb-1">Price Range</p>
                    <p className="text-sm text-gray-400">{store.priceRange}</p>
                  </div>
                </div>
              )}

              {/* Website */}
              {store.website && (
                <div className="flex gap-3 pt-3 border-t border-gray-700/50">
                  <Globe className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-gray-300 mb-1">Website</p>
                    <a
                      href={store.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-medium"
                    >
                      Visit Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Instagram */}
              {store.instagram && (
                <div className="flex gap-3 pt-3 border-t border-gray-700/50">
                  <Instagram className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-gray-300 mb-1">Instagram</p>
                    <a
                      href={`https://instagram.com/${store.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-medium"
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
              <button
                onClick={() => setInstagramModalOpen(true)}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-300 font-bold uppercase rounded-lg hover:from-pink-500/30 hover:to-purple-600/30 transition-all flex items-center justify-center gap-2 border border-pink-500/30 hover:border-pink-500/50"
                style={{
                  boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)'
                }}
              >
                <Share2 className="w-5 h-5" />
                Share to Instagram
              </button>
              <button
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 text-cyan-300 font-bold uppercase rounded-lg hover:from-cyan-500/30 hover:to-cyan-600/30 transition-all flex items-center justify-center gap-2 border border-cyan-500/30 hover:border-cyan-500/50"
                style={{
                  boxShadow: '0 0 20px rgba(34, 217, 238, 0.2)'
                }}
              >
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

      {/* Instagram Generator Modal */}
      <InstagramGeneratorModal
        store={store}
        isOpen={instagramModalOpen}
        onClose={() => setInstagramModalOpen(false)}
      />
    </div>
  );
}

