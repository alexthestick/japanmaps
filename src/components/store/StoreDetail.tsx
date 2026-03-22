import { MapPin, ExternalLink, Instagram, Clock, Navigation, X, Heart, ArrowUpRight, DollarSign, CheckCircle2 } from 'lucide-react';
import type { Store } from '../../types/store';
import { getGoogleMapsUrl } from '../../utils/formatters';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { logger } from '../../utils/logger';
import { saveStore, unsaveStore, isStoreSaved } from '../../utils/savedStores';
import { ikUrl } from '../../utils/ikUrl';
import { BlurImage } from '../common/BlurImage';

interface StoreDetailProps {
  store: Store;
  onClose: () => void;
}

export function StoreDetail({ store, onClose }: StoreDetailProps) {
  logger.log('StoreDetail rendered with store:', store?.name);
  const [isSaved, setIsSaved] = useState(() => isStoreSaved(store.id));

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      unsaveStore(store.id);
      setIsSaved(false);
    } else {
      saveStore(store);
      setIsSaved(true);
    }
  };

  const storeUrl = `/store/${store.slug || store.id}`;

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
      <div className="absolute top-4 right-14 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 z-10" />

      {/* Top-right action buttons: Save + Close */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <motion.button
          onClick={handleSaveToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border-2 border-cyan-400/50 backdrop-blur-sm"
          style={{ boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' }}
          aria-label={isSaved ? 'Unsave store' : 'Save store'}
        >
          <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'fill-cyan-400 text-cyan-400' : 'text-cyan-300'}`} />
        </motion.button>
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border-2 border-cyan-400/50 backdrop-blur-sm group"
          style={{ boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' }}
          aria-label="Close"
        >
          <X className="w-4 h-4 text-cyan-300 group-hover:text-white transition-colors duration-150" />
        </motion.button>
      </div>

      {/* Hero Image */}
      {store.photos[0] && (
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full h-[300px] md:h-[400px] bg-gray-800 overflow-hidden group"
        >
          <BlurImage
            src={ikUrl(store.photos[0], 'card')}
            alt={store.name}
            loading="eager"
            className="w-full h-full"
            imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-cyan-400/10" />
          {/* Save count badge — social proof */}
          {store.saveCount > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-full border border-cyan-400/30">
              <Heart className="w-3 h-3 text-cyan-400 fill-cyan-400" />
              <span className="text-xs font-bold text-cyan-300">{store.saveCount}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Content */}
      <div className="px-6 py-6 space-y-5 relative z-10">

        {/* Header: name, Japanese name, verified, price */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="space-y-1.5"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight italic leading-tight" style={{ textShadow: '0 0 20px rgba(34, 217, 238, 0.4)' }}>
                {store.name}
              </h1>
              {store.nameJapanese && (
                <p className="text-sm text-gray-400 mt-0.5">{store.nameJapanese}</p>
              )}
            </div>
            {store.priceRange && (
              <span className="flex-shrink-0 mt-1 flex items-center gap-0.5 px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-bold text-yellow-400">
                <DollarSign className="w-3 h-3" />
                {store.priceRange}
              </span>
            )}
          </div>

          {/* Category pills + verified */}
          <div className="flex flex-wrap gap-1.5 text-xs pt-1">
            {store.categories.slice(0, 3).map((cat, idx) => (
              <motion.span
                key={cat}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + idx * 0.07 }}
                className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 uppercase tracking-wider rounded-full border border-cyan-400/30"
              >
                {cat.replace('-', ' ')}
              </motion.span>
            ))}
            {store.verified && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white font-bold uppercase tracking-wider rounded-full border border-cyan-400/50"
                style={{ boxShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}
              >
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Info: address + hours */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="space-y-3 py-4 border-t border-cyan-400/20"
        >
          <div className="flex gap-3 items-start">
            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              {store.address && <p className="text-white leading-relaxed">{store.address}</p>}
              <p className="text-gray-400 mt-0.5">
                {store.neighborhood && `${store.neighborhood}, `}
                {store.city}{store.country && `, ${store.country}`}
              </p>
            </div>
          </div>
          {store.hours && (
            <div className="flex gap-3 items-start">
              <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white whitespace-pre-line leading-relaxed">{store.hours}</p>
            </div>
          )}
        </motion.div>

        {/* Description */}
        {store.description && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.35 }}
            className="py-4 border-t border-cyan-400/20"
          >
            <p className="text-sm text-gray-300 leading-relaxed">{store.description}</p>
          </motion.div>
        )}

        {/* Photo Gallery */}
        {store.photos.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.35 }}
            className="space-y-2.5 py-4 border-t border-cyan-400/20"
          >
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 italic">Gallery</h3>
            <div className="grid grid-cols-2 gap-2">
              {store.photos.slice(1, 5).map((photo, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  className="relative aspect-square overflow-hidden rounded-lg border border-cyan-400/30 group"
                >
                  <BlurImage
                    src={ikUrl(photo, 'thumb')}
                    alt={`${store.name} - ${idx + 2}`}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-cyan-400/5 group-hover:bg-cyan-400/15 transition-colors" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.35 }}
          className="space-y-2.5 pt-4 border-t border-cyan-400/20"
        >
          {/* View Full Page — primary CTA */}
          <Link
            to={storeUrl}
            className="relative flex items-center justify-center gap-2 w-full h-11 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white text-sm font-bold tracking-wide border-2 border-cyan-300/50 overflow-hidden hover:brightness-110 transition-all"
            style={{ boxShadow: '0 0 20px rgba(34, 217, 238, 0.4)' }}
          >
            <div className="absolute inset-0 film-grain opacity-10" />
            <ArrowUpRight className="w-4 h-4 relative z-10" />
            <span className="relative z-10">VIEW FULL PAGE</span>
          </Link>

          {/* Directions */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open(getGoogleMapsUrl(store.latitude, store.longitude), '_blank')}
            className="flex items-center justify-center gap-2 w-full h-11 bg-gray-800 text-cyan-300 text-sm font-bold border-2 border-cyan-400/50 tracking-wide hover:bg-cyan-500/20 hover:text-white transition-all duration-150"
            style={{ boxShadow: '0 0 12px rgba(34, 217, 238, 0.15)' }}
          >
            <Navigation className="w-4 h-4" />
            GET DIRECTIONS
          </motion.button>

          {/* Website + Instagram side by side */}
          {(store.website || store.instagram) && (
            <div className="grid grid-cols-2 gap-2">
              {store.website && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open(store.website, '_blank')}
                  className="flex items-center justify-center gap-1.5 h-11 bg-gray-800 text-cyan-300 text-sm font-bold border-2 border-cyan-400/50 hover:bg-cyan-500/20 hover:text-white transition-all duration-150"
                >
                  <ExternalLink className="w-4 h-4" />
                  WEBSITE
                </motion.button>
              )}
              {store.instagram && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open(`https://instagram.com/${store.instagram!.replace('@', '')}`, '_blank')}
                  className="flex items-center justify-center gap-1.5 h-11 bg-pink-500/10 text-pink-300 text-sm font-bold border-2 border-pink-400/40 hover:bg-pink-500/20 hover:text-white transition-all duration-150"
                >
                  <Instagram className="w-4 h-4" />
                  INSTAGRAM
                </motion.button>
              )}
            </div>
          )}
        </motion.div>

        {/* Bottom safe area */}
        <div className="h-4" />
      </div>
    </motion.div>
  );
}
