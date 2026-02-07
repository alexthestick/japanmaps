import { ArrowRight, Shirt, UtensilsCrossed, Coffee, Home, Building2, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, memo } from 'react';
import type { Store } from '../../types/store';
import { MAIN_CATEGORY_ICONS, CITY_COLORS } from '../../lib/constants';
import { SaveButton } from './SaveButton';
import { WashiTexture } from '../common/WashiTexture';

// Map icon names to actual icon components
const getCategoryIcon = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'Shirt': Shirt,
    'UtensilsCrossed': UtensilsCrossed,
    'Coffee': Coffee,
    'Home': Home,
    'Building2': Building2,
  };
  return iconMap[iconName] || Shirt; // Default to Shirt if not found
};

interface StoreCardProps {
  store: Store;
  onClick: () => void;
}

function StoreCardComponent({ store, onClick }: StoreCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const mainCategory = store.mainCategory || 'Fashion';
  const iconName = MAIN_CATEGORY_ICONS[mainCategory as keyof typeof MAIN_CATEGORY_ICONS];
  const Icon = getCategoryIcon(iconName);

  // Filter out generic categories like 'Shopping' and 'Fashion', prefer subcategories
  const categoryChips = store.categories
    .filter(cat => !['Shopping','Fashion','Food','Coffee','Museum','Home Goods'].includes(cat))
    .slice(0, 2)
    .map(c => c.replace('-', ' '));
  const primaryCategory = categoryChips[0] || mainCategory;

  const storeUrl = `/store/${store.slug || store.id}`;

  return (
    <Link
      to={storeUrl}
      onClick={(e) => {
        // Allow the Link to handle navigation, but also call onClick for any tracking
        onClick();
      }}
      className="group cursor-pointer relative block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Neon glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-blue-500/30 to-purple-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Card container */}
      <div className="relative bg-gray-900/90 rounded-2xl border-2 border-cyan-400/30 group-hover:border-cyan-400/60 shadow-lg overflow-hidden transition-all duration-300"
           style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)' }}>
        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/60 z-20" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/60 z-20" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/60 z-20" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/60 z-20" />

        {/* Image Container */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-800">
          <img
            src={store.photos[0] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=750&fit=crop&q=80'}
            alt={store.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Cyan tint overlay */}
          <div className="absolute inset-0 bg-cyan-400/5" />

          {/* Dark gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-90' : 'opacity-50'}`} />

          {/* Cyan shimmer on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          </div>

          {/* Explore Button - Center on Hover */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} z-10`}>
            <div className="flex items-center gap-2 text-white text-base md:text-lg font-bold">
              Explore <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* Category Icon - Bottom Left */}
          <div className="absolute bottom-3 left-3 text-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-cyan-400/50 z-10"
               style={{ boxShadow: '0 0 15px rgba(34, 217, 238, 0.3)' }}>
            <Icon className="w-5 h-5 text-cyan-300" />
          </div>

          {/* Save Heart - Top Right */}
          <div className="absolute top-3 right-3 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 backdrop-blur-sm rounded-full shadow-sm border border-cyan-400/50 transition-all z-10"
               style={{ boxShadow: '0 0 15px rgba(34, 217, 238, 0.3)' }}
               onClick={(e) => e.preventDefault()}>
            <SaveButton storeId={store.id} />
          </div>
        </div>

        {/* Store Info */}
        <div className="relative p-3 md:p-4 space-y-2">
          {/* Film grain instead of washi */}
          <div className="absolute inset-0 film-grain opacity-10" />

          <div className="relative z-10">
            <h3 className="text-sm md:text-base font-bold text-white tracking-tight line-clamp-2"
                style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
              {store.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] md:text-xs uppercase tracking-wider text-cyan-300 font-medium">
                {/* City color dot */}
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: CITY_COLORS[store.city] || '#22D9EE' }}
                />
                {store.city}
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-[11px] md:text-xs text-gray-400 uppercase tracking-wider">
                {store.neighborhood || primaryCategory}
              </span>
            </div>

            {/* Category chips */}
            {categoryChips.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {categoryChips.map((chip) => (
                  <span key={chip} className="px-2 py-0.5 text-[11px] md:text-[12px] rounded-full bg-cyan-500/20 text-cyan-300 capitalize border border-cyan-400/30">
                    {chip}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
    </Link>
  );
}

export const StoreCard = memo(StoreCardComponent, (prevProps, nextProps) => {
  // Only re-render if store ID or onClick changed
  return prevProps.store.id === nextProps.store.id && prevProps.onClick === nextProps.onClick;
});

StoreCard.displayName = 'StoreCard';

