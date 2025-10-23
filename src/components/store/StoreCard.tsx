import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, memo } from 'react';
import type { Store } from '../../types/store';
import { MAIN_CATEGORY_ICONS, CITY_COLORS } from '../../lib/constants';
import { SaveButton } from './SaveButton';
import { WashiTexture } from '../common/WashiTexture';

interface StoreCardProps {
  store: Store;
  onClick: () => void;
}

function StoreCardComponent({ store, onClick }: StoreCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const mainCategory = store.mainCategory || 'Fashion';
  const categoryIcon = MAIN_CATEGORY_ICONS[mainCategory as keyof typeof MAIN_CATEGORY_ICONS];

  // Filter out generic categories like 'Shopping' and 'Fashion', prefer subcategories
  const categoryChips = store.categories
    .filter(cat => !['Shopping','Fashion','Food','Coffee','Museum','Home Goods'].includes(cat))
    .slice(0, 2)
    .map(c => c.replace('-', ' '));
  const primaryCategory = categoryChips[0] || mainCategory;

  return (
    <motion.div
      className="group cursor-pointer bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md overflow-hidden"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-100">
        {store.photos[0] ? (
          <img
            src={store.photos[0]}
            alt={store.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        {/* Overlay on Hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-70' : 'opacity-30'}`} />

        {/* Explore Button - Center on Hover */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 text-white text-base md:text-lg font-medium">
            Explore <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        {/* Category Icon - Bottom Left */}
        <div className="absolute bottom-3 left-3 text-2xl bg-white/90 w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
          {categoryIcon}
        </div>

        {/* Save Heart - Top Right */}
        <div className="absolute top-3 right-3 bg-white/90 rounded-full shadow-sm hover:bg-white transition-all">
          <SaveButton storeId={store.id} />
        </div>
      </div>

      {/* Store Info */}
      <div className="relative p-3 md:p-4 space-y-2">
        <WashiTexture opacity={0.03} />
        <div className="relative z-10">
        <h3 className="text-sm md:text-base font-bold text-gray-900 tracking-tight line-clamp-2">
          {store.name}
        </h3>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 text-[11px] md:text-xs uppercase tracking-wider text-gray-700"
          >
            {/* City color dot */}
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: CITY_COLORS[store.city] || '#9CA3AF' }}
            />
            {store.city}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-[11px] md:text-xs text-gray-600 uppercase tracking-wider">
            {store.neighborhood || primaryCategory}
          </span>
        </div>

        {/* Category chips */}
        {categoryChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {categoryChips.map((chip) => (
              <span key={chip} className="px-2 py-0.5 text-[11px] md:text-[12px] rounded-full bg-gray-100 text-gray-700 capitalize">
                {chip}
              </span>
            ))}
          </div>
        )}
        </div>
      </div>
    </motion.div>
  );
}

export const StoreCard = memo(StoreCardComponent, (prevProps, nextProps) => {
  // Only re-render if store ID or onClick changed
  return prevProps.store.id === nextProps.store.id && prevProps.onClick === nextProps.onClick;
});

StoreCard.displayName = 'StoreCard';

