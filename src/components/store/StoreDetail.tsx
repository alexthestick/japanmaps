import { MapPin, ExternalLink, Instagram, Clock, Navigation, X } from 'lucide-react';
import type { Store } from '../../types/store';
import { getGoogleMapsUrl } from '../../utils/formatters';
import { useEffect } from 'react';

interface StoreDetailProps {
  store: Store;
  onClose: () => void;
}

export function StoreDetail({ store, onClose }: StoreDetailProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed right-0 top-16 h-[calc(100vh-64px)] w-full md:w-[360px] bg-white z-50 transform translate-x-0 transition-transform duration-300 ease-in-out overflow-y-auto md:shadow-2xl md:border-l md:border-gray-200 max-md:bottom-0 max-md:top-auto max-md:h-[85vh] max-md:rounded-t-2xl max-md:shadow-[0_-4px_12px_rgba(0,0,0,0.1)]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button - Fixed at top right inside sidebar */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-150 group border border-gray-200"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors duration-150" />
      </button>

      {/* Hero Image - Full width with better aspect ratio */}
      {store.photos[0] && (
        <div className="w-full h-[300px] md:h-[400px] bg-gray-100">
          <img
            src={store.photos[0]}
            alt={store.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{store.name}</h1>

          {/* Category Tags - Minimal style */}
          <div className="flex flex-wrap gap-2 text-xs">
            {store.categories.slice(0, 3).map(cat => (
              <span
                key={cat}
                className="text-gray-600 uppercase tracking-wider"
              >
                {cat.replace('-', ' ')}
              </span>
            ))}
            {store.verified && (
              <span className="text-gray-900 font-medium uppercase tracking-wider">
                • Verified
              </span>
            )}
          </div>
        </div>

        {/* Info Section - Clean layout with icons */}
        <div className="space-y-4 py-4 border-t border-gray-200">
          {/* Address */}
          <div className="flex gap-4">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-gray-900 leading-relaxed">{store.address}</p>
              <p className="text-gray-500 mt-1">
                {store.neighborhood && `${store.neighborhood}, `}
                {store.city}, {store.country}
              </p>
            </div>
          </div>

          {/* Hours */}
          {store.hours && (
            <div className="flex gap-4">
              <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-900">{store.hours}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {store.description && (
          <div className="py-4 border-t border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">{store.description}</p>
          </div>
        )}

        {/* Photo Gallery */}
        {store.photos.length > 1 && (
          <div className="space-y-3 py-4 border-t border-gray-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Gallery</h3>
            <div className="grid grid-cols-2 gap-2">
              {store.photos.slice(1).map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`${store.name} - ${idx + 2}`}
                  className="w-full h-[200px] object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons - Minimal outlined style */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => window.open(getGoogleMapsUrl(store.address), '_blank')}
            className="flex items-center justify-center gap-2 w-full h-12 bg-gray-900 text-white text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors duration-150"
          >
            <Navigation className="w-4 h-4" />
            GET DIRECTIONS
          </button>

          {store.website && (
            <button
              onClick={() => window.open(store.website, '_blank')}
              className="flex items-center justify-center gap-2 w-full h-12 bg-white text-gray-900 text-sm font-medium border border-gray-900 tracking-wide hover:bg-gray-900 hover:text-white transition-all duration-150"
            >
              <ExternalLink className="w-4 h-4" />
              VISIT WEBSITE
            </button>
          )}

          {store.instagram && (
            <button
              onClick={() => window.open(`https://instagram.com/${store.instagram!.replace('@', '')}`, '_blank')}
              className="flex items-center justify-center gap-2 w-full h-12 bg-white text-gray-900 text-sm font-medium border border-gray-900 tracking-wide hover:bg-gray-900 hover:text-white transition-all duration-150"
            >
              <Instagram className="w-4 h-4" />
              INSTAGRAM
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

