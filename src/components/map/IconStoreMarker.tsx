import { MAIN_CATEGORY_COLORS, MAIN_CATEGORY_ICONS, FASHION_COLORS, HOME_GOODS_COLORS } from '../../lib/constants';
import type { Store, MainCategory, FashionSubCategory } from '../../types/store';

interface IconStoreMarkerProps {
  store: Store;
  activeFilter?: string | null; // Active sub-category filter
  activeMainCategory?: string | null; // Currently selected main category filter
  onHoverChange?: (storeId: string | null) => void;
}

export function IconStoreMarker({ store, activeFilter, activeMainCategory, onHoverChange }: IconStoreMarkerProps) {
  // Default to 'Fashion' if mainCategory not set yet (before migration)
  const mainCategory = store.mainCategory || 'Fashion';

  // Determine pin color based on filter state
  const getPinColor = (): string => {
    // Only apply sub-category-based coloring when that main category is actively selected
    if (activeMainCategory === 'Fashion') {
      if (activeFilter && FASHION_COLORS[activeFilter as FashionSubCategory]) {
        return FASHION_COLORS[activeFilter as FashionSubCategory];
      }
      if (!activeFilter && mainCategory === 'Fashion') {
        const firstCategory = store.categories[0];
        if (FASHION_COLORS[firstCategory as FashionSubCategory]) {
          return FASHION_COLORS[firstCategory as FashionSubCategory];
        }
      }
    }

    if (activeMainCategory === 'Home Goods') {
      if (activeFilter && HOME_GOODS_COLORS[activeFilter as keyof typeof HOME_GOODS_COLORS]) {
        return HOME_GOODS_COLORS[activeFilter as keyof typeof HOME_GOODS_COLORS];
      }
      if (!activeFilter && mainCategory === 'Home Goods') {
        const firstCategory = store.categories[0];
        if (HOME_GOODS_COLORS[firstCategory as keyof typeof HOME_GOODS_COLORS]) {
          return HOME_GOODS_COLORS[firstCategory as keyof typeof HOME_GOODS_COLORS];
        }
      }
    }

    // Default: use main category color
    return MAIN_CATEGORY_COLORS[mainCategory];
  };

  const getIcon = (): string => {
    return MAIN_CATEGORY_ICONS[mainCategory];
  };

  const color = getPinColor();
  const icon = getIcon();

  const handleMouseEnter = () => {
    if (onHoverChange) {
      onHoverChange(store.id);
    }
  };

  const handleMouseLeave = () => {
    if (onHoverChange) {
      onHoverChange(null);
    }
  };

  return (
    <div
      className="cursor-pointer transform hover:scale-110 transition-all duration-200 hover:z-50 relative"
      style={{
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))'
      }}
      title={`${store.name} - ${mainCategory}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Pin background */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill={color}
        stroke="white"
        strokeWidth="1"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>

      {/* Icon overlay */}
      <div
        className="absolute top-[6px] left-1/2 transform -translate-x-1/2 text-xl pointer-events-none"
        style={{
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        {icon}
      </div>
    </div>
  );
}
