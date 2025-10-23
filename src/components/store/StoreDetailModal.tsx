import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Clock, ExternalLink, Instagram, Navigation } from 'lucide-react';
import type { Store } from '../../types/store';
import { getGoogleMapsUrl } from '../../utils/formatters';
import { MAIN_CATEGORY_ICONS } from '../../lib/constants';

interface StoreDetailModalProps {
  store: Store;
  onClose: () => void;
}

type TabType = 'gallery' | 'details' | 'community' | 'map';

export function StoreDetailModal({ store, onClose }: StoreDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('gallery');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const images = store.photos.length > 0 ? store.photos : ['/placeholder.jpg'];
  const mainCategory = store.mainCategory || 'Fashion';
  const categoryIcon = MAIN_CATEGORY_ICONS[mainCategory as keyof typeof MAIN_CATEGORY_ICONS];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const tabs = [
    { id: 'gallery' as TabType, label: 'Gallery' },
    { id: 'details' as TabType, label: 'Details' },
    { id: 'community' as TabType, label: 'Community' },
    { id: 'map' as TabType, label: 'Map' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative border-b border-gray-200 px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 pr-12">{store.name}</h1>
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 transition-colors rounded-full"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-8">
            <div className="flex gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 text-sm font-medium tracking-wide uppercase transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            {activeTab === 'gallery' && (
              <div className="p-8">
                {/* Main Image */}
                <div className="relative bg-gray-100 mb-6" style={{ height: '500px' }}>
                  <img
                    src={images[currentImageIndex]}
                    alt={`${store.name} - ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-900" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-900" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black bg-opacity-60 text-white text-sm rounded-full">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-24 h-24 border-2 transition-all ${
                          idx === currentImageIndex
                            ? 'border-gray-900'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="p-8 space-y-8">
                {/* Category Tags */}
                <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-gray-600">
                  <span className="text-2xl">{categoryIcon}</span>
                  {store.categories.filter(cat => cat !== 'Shopping' && cat !== 'Fashion').slice(0, 3).map(cat => (
                    <span key={cat}>{cat.replace('-', ' ')}</span>
                  ))}
                </div>

                {/* Address */}
                <div className="flex gap-4 py-4 border-t border-gray-200">
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
                  <div className="flex gap-4 py-4 border-t border-gray-200">
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-900">{store.hours}</p>
                  </div>
                )}

                {/* Description */}
                {store.description && (
                  <div className="py-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{store.description}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => window.open(getGoogleMapsUrl(store.address), '_blank')}
                    className="flex items-center justify-center gap-2 w-full h-12 bg-gray-900 text-white text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    GET DIRECTIONS
                  </button>

                  {store.website && (
                    <button
                      onClick={() => window.open(store.website, '_blank')}
                      className="flex items-center justify-center gap-2 w-full h-12 bg-white text-gray-900 text-sm font-medium border border-gray-900 tracking-wide hover:bg-gray-900 hover:text-white transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      VISIT WEBSITE
                    </button>
                  )}

                  {store.instagram && (
                    <button
                      onClick={() => window.open(`https://instagram.com/${store.instagram!.replace('@', '')}`, '_blank')}
                      className="flex items-center justify-center gap-2 w-full h-12 bg-white text-gray-900 text-sm font-medium border border-gray-900 tracking-wide hover:bg-gray-900 hover:text-white transition-all"
                    >
                      <Instagram className="w-4 h-4" />
                      INSTAGRAM
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="p-8">
                <div className="text-center py-16 space-y-4">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-2xl font-bold text-gray-900">Community Features Coming Soon</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Share photos, write reviews, and connect with other shoppers who love this store.
                  </p>
                  <div className="mt-8 p-6 bg-gray-50 max-w-lg mx-auto text-left space-y-3 text-sm text-gray-700">
                    <p className="font-medium text-gray-900">Coming features:</p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Upload photos of your purchases</li>
                      <li>Share interior shots and styling tips</li>
                      <li>Write reviews and recommendations</li>
                      <li>Connect with fellow vintage hunters</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="p-8">
                <div className="bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ height: '400px' }}>
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center space-y-2">
                      <MapPin className="w-12 h-12 mx-auto text-gray-400" />
                      <p className="text-sm">Interactive map view</p>
                      <p className="text-xs text-gray-400">Mini-map integration coming soon</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {store.neighborhood && `${store.neighborhood}, `}
                  {store.city}, {store.country}
                </p>
                <button
                  onClick={() => window.open(getGoogleMapsUrl(store.address), '_blank')}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-900 border border-gray-900 hover:bg-gray-900 hover:text-white transition-all"
                >
                  Open in Google Maps
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
