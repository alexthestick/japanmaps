import { Crosshair, Loader2 } from 'lucide-react';

interface LocateButtonProps {
  onClick: () => void;
  loading?: boolean;
  hasLocation?: boolean;
}

export function LocateButton({ onClick, loading = false, hasLocation = false }: LocateButtonProps) {
  return (
    <div
      className="absolute right-6 z-20 md:bottom-6 md:right-24"
      style={{
        // Mobile: 32px (128px) + safe area inset for iOS devices
        // Desktop: 6px (24px) as before
        bottom: 'max(128px, calc(128px + env(safe-area-inset-bottom, 0px)))',
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
