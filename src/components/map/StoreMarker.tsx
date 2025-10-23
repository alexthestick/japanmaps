import { PIN_COLORS } from '../../lib/constants';
import type { Store } from '../../types/store';

interface StoreMarkerProps {
  store: Store;
  onHoverChange?: (storeId: string | null) => void;
}

export function StoreMarker({ store, onHoverChange }: StoreMarkerProps) {
  const primaryCategory = store.categories[0];
  const color = PIN_COLORS[primaryCategory as keyof typeof PIN_COLORS] || '#6B7280';

  // Debug logging - check if category is recognized
  if (!PIN_COLORS[primaryCategory as keyof typeof PIN_COLORS]) {
    console.log('⚠️ Unknown category for:', store.name, '| Category:', primaryCategory, '| Available:', Object.keys(PIN_COLORS));
  }

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
      className="cursor-pointer transform hover:scale-115 transition-all duration-200 hover:z-50"
      style={{ 
        color,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
      }}
      title={store.name}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="white"
        strokeWidth="1.5"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    </div>
  );
}


