import { List, Map } from 'lucide-react';

interface ViewToggleButtonProps {
  currentView: 'map' | 'list';
  onToggle: (view: 'map' | 'list') => void;
}

export function ViewToggleButton({ currentView, onToggle }: ViewToggleButtonProps) {
  const isMapView = currentView === 'map';

  return (
    <div
      className="absolute right-6 z-20"
      style={{
        // Position at 128px from bottom + safe area for iOS
        bottom: 'max(128px, calc(128px + env(safe-area-inset-bottom, 0px)))',
      }}
    >
      <button
        onClick={() => onToggle(isMapView ? 'list' : 'map')}
        className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white px-3 py-2 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 font-bold text-xs border-2 border-cyan-300/50 overflow-hidden"
        style={{ boxShadow: '0 0 20px rgba(34, 217, 238, 0.3), 0 6px 20px rgba(0, 0, 0, 0.2)' }}
      >
        {/* Film grain */}
        <div className="absolute inset-0 film-grain opacity-10" />

        <div className="relative flex items-center gap-1">
          {isMapView ? (
            <>
              <List className="w-4 h-4" />
              <span>List</span>
            </>
          ) : (
            <>
              <Map className="w-4 h-4" />
              <span>Map</span>
            </>
          )}
        </div>
      </button>
    </div>
  );
}
