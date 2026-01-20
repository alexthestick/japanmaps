import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
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
import { MAIN_CATEGORY_COLORS } from '../lib/constants';
import { MAPBOX_TOKEN, MAP_STYLE_NIGHT } from '../lib/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [store, setStore] = useState<Store | null>(null);
  const [similarStores, setSimilarStores] = useState<Store[]>([]);
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

  // Fetch similar stores when main store is loaded
  useEffect(() => {
    if (store) {
      fetchSimilarStores(store);
    }
  }, [store]);

  async function fetchSimilarStores(currentStore: Store) {
    try {
      // Fetch stores that match either same category in same city, or same subcategory anywhere
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .neq('id', currentStore.id) // Exclude current store
        .limit(20);

      if (data && !error) {
        // Score and sort by relevance
        const scoredStores = data.map((s: any) => {
          let score = 0;
          // Same main category = 2 points
          if (s.main_category === currentStore.mainCategory) score += 2;
          // Same city = 2 points
          if (s.city === currentStore.city) score += 2;
          // Same neighborhood = 1 point
          if (s.neighborhood === currentStore.neighborhood) score += 1;
          // Overlapping subcategories = 1 point each
          const overlap = currentStore.categories.filter(c => s.categories?.includes(c)).length;
          score += overlap;

          return { store: s, score };
        })
        .filter(item => item.score > 0) // Only include if there's some relevance
        .sort((a, b) => b.score - a.score) // Sort by score descending
        .slice(0, 6) // Take top 6
        .map(item => ({
          id: item.store.id,
          slug: item.store.slug || generateSlug(item.store.name, item.store.city),
          name: item.store.name,
          nameJapanese: item.store.name_japanese,
          address: item.store.address,
          city: item.store.city,
          neighborhood: item.store.neighborhood,
          country: item.store.country,
          latitude: 0,
          longitude: 0,
          mainCategory: item.store.main_category,
          categories: item.store.categories || [],
          photos: item.store.photos || [],
          verified: item.store.verified,
          createdAt: item.store.created_at,
          updatedAt: item.store.updated_at,
          haulCount: item.store.haul_count || 0,
          saveCount: item.store.save_count || 0,
        }));

        setSimilarStores(scoredStores);
      }
    } catch (err) {
      console.error('Error fetching similar stores:', err);
    }
  }

  async function fetchStore(idOrSlug: string) {
    try {
      setLoading(true);

      let data: any = null;
      let fetchError: any = null;

      // If it's a UUID, fetch by ID
      if (isUUID(idOrSlug)) {
        const result = await supabase
          .from('stores')
          .select('*')
          .eq('id', idOrSlug)
          .single();

        data = result.data;
        fetchError = result.error;
      } else {
        // For slugs, fetch all stores and match by generated slug
        // This avoids issues if the slug column doesn't exist in the database
        const { data: allStores, error } = await supabase
          .from('stores')
          .select('*');

        if (error) {
          fetchError = error;
        } else if (allStores) {
          // Find store by matching generated slug
          data = allStores.find((s: any) =>
            generateSlug(s.name, s.city) === idOrSlug
          );
          if (!data) {
            fetchError = new Error('Store not found');
          }
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
          <div className="flex flex-wrap items-center gap-4 mb-3">
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

          {/* Japanese name if available */}
          {store.nameJapanese && (
            <p className="text-xl text-gray-400 mb-3 font-medium">{store.nameJapanese}</p>
          )}

          {/* Location */}
          <p className="text-lg text-gray-400 mb-4">
            {store.neighborhood ? `${store.neighborhood}, ` : ''}{store.city}
          </p>

          {/* Category Tags - Moved from separate section */}
          <div className="flex flex-wrap items-center gap-2">
            {store.mainCategory && (
              <span
                className="px-4 py-1.5 text-sm font-bold uppercase rounded-full text-white"
                style={{
                  backgroundColor: MAIN_CATEGORY_COLORS[store.mainCategory as keyof typeof MAIN_CATEGORY_COLORS] || '#22D9EE',
                  boxShadow: `0 0 15px ${MAIN_CATEGORY_COLORS[store.mainCategory as keyof typeof MAIN_CATEGORY_COLORS] || '#22D9EE'}40`
                }}
              >
                {store.mainCategory}
              </span>
            )}
            {store.categories.map((category) => (
              <span
                key={category}
                className="px-3 py-1.5 bg-gray-700/50 text-gray-300 text-sm font-medium rounded-full border border-gray-600/30"
              >
                {category}
              </span>
            ))}
          </div>
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
                {MAPBOX_TOKEN ? (
                  <Map
                    longitude={store.longitude}
                    latitude={store.latitude}
                    zoom={15}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle={MAP_STYLE_NIGHT}
                    mapboxAccessToken={MAPBOX_TOKEN}
                    interactive={true}
                    scrollZoom={false}
                  >
                    <NavigationControl position="top-right" />
                    <Marker
                      longitude={store.longitude}
                      latitude={store.latitude}
                      anchor="bottom"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                        style={{
                          backgroundColor: store.mainCategory
                            ? MAIN_CATEGORY_COLORS[store.mainCategory as keyof typeof MAIN_CATEGORY_COLORS]
                            : '#22D9EE',
                          boxShadow: `0 0 15px ${store.mainCategory ? MAIN_CATEGORY_COLORS[store.mainCategory as keyof typeof MAIN_CATEGORY_COLORS] : '#22D9EE'}80`
                        }}
                      >
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                    </Marker>
                  </Map>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Map unavailable
                  </div>
                )}
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

      {/* Similar Stores Section */}
      {similarStores.length > 0 && (
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-12 border-t border-cyan-500/20">
          <h2
            className="text-2xl font-black italic uppercase mb-8"
            style={{
              color: '#22D9EE',
              textShadow: '0 0 20px rgba(34, 217, 238, 0.3)'
            }}
          >
            Other Places
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {similarStores.map((similarStore) => {
              const thumbnail = similarStore.photos?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop';
              const categoryColor = similarStore.mainCategory
                ? MAIN_CATEGORY_COLORS[similarStore.mainCategory as keyof typeof MAIN_CATEGORY_COLORS]
                : '#22D9EE';

              return (
                <div
                  key={similarStore.id}
                  onClick={() => navigate(`/store/${similarStore.slug || similarStore.id}`)}
                  className="group cursor-pointer bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/50 transition-all"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={thumbnail}
                      alt={similarStore.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {/* Category badge */}
                    <span
                      className="absolute top-2 left-2 px-2 py-1 text-xs font-bold uppercase rounded-full text-white"
                      style={{ backgroundColor: categoryColor }}
                    >
                      {similarStore.mainCategory}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-bold text-white text-sm truncate group-hover:text-cyan-300 transition-colors">
                      {similarStore.name}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {similarStore.neighborhood ? `${similarStore.neighborhood}, ` : ''}{similarStore.city}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Back to List Button */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-12 text-center">
        <button
          onClick={() => {
            const state = location.state as any;
            const params = new URLSearchParams(state?.params || {});
            const fallback = `/map?view=list${params.toString() ? `&${params.toString()}` : ''}`;
            navigate(fallback);
          }}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 font-bold uppercase rounded-lg hover:from-cyan-500/30 hover:to-blue-500/30 transition-all border border-cyan-500/30 hover:border-cyan-500/50"
          style={{ boxShadow: '0 0 20px rgba(34, 217, 238, 0.2)' }}
        >
          ← Back to Store List
        </button>
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

