import { Crosshair, Loader2 } from 'lucide-react';

interface LocateButtonProps {
  onClick: () => void;
  loading?: boolean;
  hasLocation?: boolean;
  // Shifts the button up to clear the Explore pill at the bottom of the map
  explorePillVisible?: boolean;
}

export function LocateButton({ onClick, loading = false, hasLocation = false, explorePillVisible = false }: LocateButtonProps) {
  return (
    <div
      className="absolute right-6 z-20 md:bottom-6 md:right-24"
      style={{
        // Shift up when the Explore pill is present to avoid overlap
        bottom: explorePillVisible
          ? 'calc(10rem + env(safe-area-inset-bottom, 0px))'
          : 'calc(6rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <button
        onClick={onClick}
        disabled={loading}
        className={`
          relative bg-white text-gray-700 p-3 rounded-full shadow-lg
          hover:scale-105 transition-all border-2
          ${hasLocation ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${loading ? 'cursor-wait' : 'hover:bg-gray-50'}
          disabled:opacity-50
        `}
        style={{
          boxShadow: hasLocation
            ? '0 0 20px rgba(59, 130, 246, 0.3), 0 4px 20px rgba(0, 0, 0, 0.2)'
            : '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
        title="Show my location"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Crosshair className={`w-5 h-5 ${hasLocation ? 'text-blue-500' : ''}`} />
        )}
      </button>
    </div>
  );
}
