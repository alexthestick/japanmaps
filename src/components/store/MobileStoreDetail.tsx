import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShoppingBag, MapPin, Clock, Globe, Instagram, ExternalLink, ChevronDown, ChevronUp, Navigation } from 'lucide-react';
import { SwipeablePhotoCarousel } from './SwipeablePhotoCarousel';
import { SaveButton } from './SaveButton';
import { InstagramGeneratorModal } from './InstagramGeneratorModal';
import type { Store } from '../../types/store';
import { getGoogleMapsUrl } from '../../utils/formatters';
import { MAIN_CATEGORY_COLORS } from '../../lib/constants';

interface MobileStoreDetailProps {
  store: Store;
  similarStores: Store[];
  onPhotoClick: (index: number) => void;
}

export function MobileStoreDetail({ store, similarStores, onPhotoClick }: MobileStoreDetailProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [instagramModalOpen, setInstagramModalOpen] = useState(false);

  const photos = store.photos && store.photos.length > 0
    ? store.photos
    : ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop'];

  const handleBack = () => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      const state = location.state as any;
      const params = new URLSearchParams(state?.params || {});
      const fallback = `/map${params.toString() ? `?${params.toString()}` : ''}`;
      navigate(fallback);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Truncate description to ~100 chars for preview
  const shortDescription = store.description && store.description.length > 100
    ? store.description.slice(0, 100) + '...'
    : store.description;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white pb-24">
      {/* Film Grain Overlay */}
      <div
        className="fixed inset-0 opacity-[0.15] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-black/90 via-black/80 to-transparent backdrop-blur-sm border-b border-cyan-400/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm text-cyan-300 rounded-full border border-cyan-500/30 hover:border-cyan-500/50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold text-sm">BACK</span>
          </button>

          <div className="flex items-center gap-2">
            <SaveButton storeId={store.id} variant="icon" />
          </div>
        </div>
      </div>

      {/* Photo Carousel */}
      <SwipeablePhotoCarousel
        photos={photos}
        storeName={store.name}
        onPhotoClick={onPhotoClick}
      />

      {/* Store Info Container */}
      <div className="relative z-10 px-4 pt-6 space-y-6">
        {/* Store Header */}
        <div>
          {/* Store Name */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1
              className="text-3xl font-black italic uppercase tracking-tight leading-tight"
              style={{
                textShadow: '0 0 30px rgba(34, 217, 238, 0.5)',
                color: '#22D9EE'
              }}
            >
              {store.name}
            </h1>
            {store.verified && (
              <span className="flex-shrink-0 px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase rounded-full border border-cyan-500/30">
                Verified
              </span>
            )}
          </div>

          {/* Location */}
          <p className="text-base text-gray-400 mb-3">
            {store.neighborhood ? `${store.neighborhood}, ` : ''}{store.city}
          </p>

          {/* Quick Facts Bar */}
          <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
            {store.hours && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Open</span>
              </div>
            )}
            {store.priceRange && (
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-400">¥</span>
                <span>{store.priceRange}</span>
              </div>
            )}
          </div>

          {/* Category Tags - Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {store.mainCategory && (
              <span
                className="flex-shrink-0 px-3 py-1.5 text-xs font-bold uppercase rounded-full text-white"
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
                className="flex-shrink-0 px-3 py-1.5 bg-gray-700/50 text-gray-300 text-xs font-medium rounded-full border border-gray-600/30"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-cyan-500/20">
          <div className="flex-1 flex items-center gap-3">
            <Heart className="w-5 h-5 text-cyan-400" />
            <div>
              <div
                className="text-2xl font-black italic"
                style={{
                  color: '#22D9EE',
                  textShadow: '0 0 20px rgba(34, 217, 238, 0.5)'
                }}
              >
                {store.saveCount}
              </div>
              <div className="text-xs text-gray-400 uppercase font-bold">Saves</div>
            </div>
          </div>

          <div className="w-px h-12 bg-gray-700/50" />

          <div className="flex-1 flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            <div>
              <div
                className="text-2xl font-black italic"
                style={{
                  color: '#22D9EE',
                  textShadow: '0 0 20px rgba(34, 217, 238, 0.5)'
                }}
              >
                {store.haulCount}
              </div>
              <div className="text-xs text-gray-400 uppercase font-bold">Hauls</div>
            </div>
          </div>
        </div>

        {/* About Section - Collapsible */}
        {store.description && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-cyan-500/20">
            <button
              onClick={() => toggleSection('about')}
              className="w-full flex items-center justify-between mb-3"
            >
              <h2
                className="text-lg font-black italic uppercase"
                style={{
                  color: '#22D9EE',
                  textShadow: '0 0 20px rgba(34, 217, 238, 0.3)'
                }}
              >
                ABOUT
              </h2>
              {expandedSection === 'about' ? (
                <ChevronUp className="w-5 h-5 text-cyan-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-cyan-400" />
              )}
            </button>

            <p className="text-sm text-gray-300 leading-relaxed">
              {expandedSection === 'about' || !shortDescription || store.description.length <= 100
                ? store.description
                : shortDescription}
            </p>

            {store.description.length > 100 && expandedSection !== 'about' && (
              <button
                onClick={() => toggleSection('about')}
                className="mt-2 text-cyan-400 text-sm font-bold hover:text-cyan-300 transition-colors"
              >
                Read more
              </button>
            )}
          </div>
        )}

        {/* Information Section - Collapsible */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-cyan-500/20">
          <button
            onClick={() => toggleSection('info')}
            className="w-full flex items-center justify-between mb-3"
          >
            <h2
              className="text-lg font-black italic uppercase"
              style={{
                color: '#22D9EE',
                textShadow: '0 0 20px rgba(34, 217, 238, 0.3)'
              }}
            >
              INFORMATION
            </h2>
            {expandedSection === 'info' ? (
              <ChevronUp className="w-5 h-5 text-cyan-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-cyan-400" />
            )}
          </button>

          {expandedSection === 'info' && (
            <div className="space-y-4">
              {/* Address */}
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Address</p>
                  <p className="text-sm text-white mb-2">{store.address}</p>
                  <a
                    href={getGoogleMapsUrl(store.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </a>
                </div>
              </div>

              {/* Hours */}
              {store.hours && (
                <>
                  <div className="h-px bg-gray-700/50" />
                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Hours</p>
                      <p className="text-sm text-white whitespace-pre-line">{store.hours}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Website */}
              {store.website && (
                <>
                  <div className="h-px bg-gray-700/50" />
                  <div className="flex gap-3">
                    <Globe className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Website</p>
                      <a
                        href={store.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                      >
                        Visit Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </>
              )}

              {/* Instagram */}
              {store.instagram && (
                <>
                  <div className="h-px bg-gray-700/50" />
                  <div className="flex gap-3">
                    <Instagram className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Instagram</p>
                      <a
                        href={`https://instagram.com/${store.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                      >
                        {store.instagram}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Related Stores */}
        {similarStores.length > 0 && (
          <div className="pt-6 border-t border-cyan-500/20">
            <h2
              className="text-lg font-black italic uppercase mb-4"
              style={{
                color: '#22D9EE',
                textShadow: '0 0 20px rgba(34, 217, 238, 0.3)'
              }}
            >
              SIMILAR STORES
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {similarStores.slice(0, 4).map((similarStore) => {
                const thumbnail = similarStore.photos?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop';
                const categoryColor = similarStore.mainCategory
                  ? MAIN_CATEGORY_COLORS[similarStore.mainCategory as keyof typeof MAIN_CATEGORY_COLORS]
                  : '#22D9EE';
                const storeUrl = `/store/${similarStore.slug || similarStore.id}`;

                return (
                  <a
                    key={similarStore.id}
                    href={storeUrl}
                    className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/50 transition-all block active:scale-95"
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
                      {similarStore.mainCategory && (
                        <span
                          className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold uppercase rounded-full text-white"
                          style={{ backgroundColor: categoryColor }}
                        >
                          {similarStore.mainCategory}
                        </span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-cyan-300 transition-colors">
                        {similarStore.name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                        {similarStore.neighborhood ? `${similarStore.neighborhood}, ` : ''}{similarStore.city}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-sm border-t border-cyan-400/20 px-4 py-4">
        <div className="flex gap-3">
          <SaveButton storeId={store.id} variant="button" className="flex-1" />
          <button
            onClick={() => setInstagramModalOpen(true)}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-300 font-bold uppercase rounded-lg hover:from-pink-500/30 hover:to-purple-600/30 transition-all flex items-center justify-center gap-2 border border-pink-500/30 active:scale-95"
            style={{ boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)' }}
          >
            <Share2 className="w-4 h-4" />
            <span className="text-xs">Share</span>
          </button>
          <button
            className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 text-cyan-300 font-bold uppercase rounded-lg hover:from-cyan-500/30 hover:to-cyan-600/30 transition-all flex items-center justify-center gap-2 border border-cyan-500/30 active:scale-95"
            style={{ boxShadow: '0 0 20px rgba(34, 217, 238, 0.2)' }}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs">Haul</span>
          </button>
        </div>
      </div>

      {/* Instagram Generator Modal */}
      <InstagramGeneratorModal
        store={store}
        isOpen={instagramModalOpen}
        onClose={() => setInstagramModalOpen(false)}
      />
    </div>
  );
}
