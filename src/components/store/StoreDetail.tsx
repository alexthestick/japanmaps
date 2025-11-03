import { MapPin, ExternalLink, Instagram, Clock, Navigation, X } from 'lucide-react';
import type { Store } from '../../types/store';
import { getGoogleMapsUrl } from '../../utils/formatters';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface StoreDetailProps {
  store: Store;
  onClose: () => void;
}

export function StoreDetail({ store, onClose }: StoreDetailProps) {
  // Debug log
  console.log('StoreDetail rendered with store:', store?.name);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed right-0 top-16 h-[calc(100vh-64px)] w-full md:w-[400px] bg-gradient-to-b from-gray-900 via-black to-gray-900 z-[100] overflow-y-auto border-l-2 border-cyan-400/40 max-md:bottom-0 max-md:top-auto max-md:h-[85vh] max-md:rounded-t-2xl"
      style={{ boxShadow: '-10px 0 40px rgba(34, 217, 238, 0.2)' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Film grain overlay */}
      <div className="absolute inset-0 film-grain opacity-20 pointer-events-none z-0" />

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 z-10" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 z-10" />
      {/* Close Button - Kirby themed */}
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-6 right-6 z-20 p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border-2 border-cyan-400/50 backdrop-blur-sm group"
        style={{ boxShadow: '0 0 20px rgba(34, 217, 238, 0.3)' }}
        aria-label="Close"
      >
        <X className="w-5 h-5 text-cyan-300 group-hover:text-white transition-colors duration-150" />
      </motion.button>

      {/* Hero Image with cyan tint and shimmer effect */}
      {store.photos[0] && (
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-[300px] md:h-[400px] bg-gray-800 overflow-hidden group"
        >
          <img
            src={store.photos[0]}
            alt={store.name}
            className="w-full h-full object-cover"
          />
          {/* Cyan tint overlay */}
          <div className="absolute inset-0 bg-cyan-400/10" />
          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent -skew-x-12"
            />
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="px-8 py-8 space-y-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="space-y-3"
        >
          <h1 className="text-3xl font-bold text-white tracking-tight italic" style={{ textShadow: '0 0 20px rgba(34, 217, 238, 0.4)' }}>
            {store.name}
          </h1>

          {/* Category Tags - Kirby style */}
          <div className="flex flex-wrap gap-2 text-xs">
            {store.categories.slice(0, 3).map((cat, idx) => (
              <motion.span
                key={cat}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 uppercase tracking-wider rounded-full border border-cyan-400/30"
              >
                {cat.replace('-', ' ')}
              </motion.span>
            ))}
            {store.verified && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="px-2.5 py-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white font-bold uppercase tracking-wider rounded-full border border-cyan-400/50"
                style={{ boxShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}
              >
                • Verified
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Info Section - Kirby themed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="space-y-4 py-4 border-t border-cyan-400/20"
        >
          {/* Address */}
          <div className="flex gap-4">
            <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-white leading-relaxed">{store.address}</p>
              <p className="text-gray-400 mt-1">
                {store.neighborhood && `${store.neighborhood}, `}
                {store.city}, {store.country}
              </p>
            </div>
          </div>

          {/* Hours */}
          {store.hours && (
            <div className="flex gap-4">
              <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white">{store.hours}</p>
            </div>
          )}
        </motion.div>

        {/* Description */}
        {store.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="py-4 border-t border-cyan-400/20"
          >
            <p className="text-sm text-gray-300 leading-relaxed">{store.description}</p>
          </motion.div>
        )}

        {/* Photo Gallery */}
        {store.photos.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="space-y-3 py-4 border-t border-cyan-400/20"
          >
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 italic">Gallery</h3>
            <div className="grid grid-cols-2 gap-2">
              {store.photos.slice(1).map((photo, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden rounded-lg border-2 border-cyan-400/30 group"
                >
                  <img
                    src={photo}
                    alt={`${store.name} - ${idx + 2}`}
                    className="w-full h-[200px] object-cover"
                  />
                  {/* Cyan tint */}
                  <div className="absolute inset-0 bg-cyan-400/10 group-hover:bg-cyan-400/20 transition-colors" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons - Kirby themed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="space-y-3 pt-4 border-t border-cyan-400/20"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open(getGoogleMapsUrl(store.address), '_blank')}
            className="relative flex items-center justify-center gap-2 w-full h-12 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white text-sm font-bold tracking-wide border-2 border-cyan-300/50 overflow-hidden"
            style={{ boxShadow: '0 0 20px rgba(34, 217, 238, 0.4)' }}
          >
            <div className="absolute inset-0 film-grain opacity-10" />
            <Navigation className="w-4 h-4 relative z-10" />
            <span className="relative z-10">GET DIRECTIONS</span>
          </motion.button>

          {store.website && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(store.website, '_blank')}
              className="flex items-center justify-center gap-2 w-full h-12 bg-gray-800 text-cyan-300 text-sm font-bold border-2 border-cyan-400/50 tracking-wide hover:bg-cyan-500/20 hover:text-white transition-all duration-150"
              style={{ boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' }}
            >
              <ExternalLink className="w-4 h-4" />
              VISIT WEBSITE
            </motion.button>
          )}

          {store.instagram && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(`https://instagram.com/${store.instagram!.replace('@', '')}`, '_blank')}
              className="flex items-center justify-center gap-2 w-full h-12 bg-gray-800 text-cyan-300 text-sm font-bold border-2 border-cyan-400/50 tracking-wide hover:bg-cyan-500/20 hover:text-white transition-all duration-150"
              style={{ boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' }}
            >
              <Instagram className="w-4 h-4" />
              INSTAGRAM
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

