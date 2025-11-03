import { List, Map } from 'lucide-react';

interface ViewToggleButtonProps {
  currentView: 'map' | 'list';
  onToggle: (view: 'map' | 'list') => void;
}

export function ViewToggleButton({ currentView, onToggle }: ViewToggleButtonProps) {
  const isMapView = currentView === 'map';

  return (
    <div className="absolute bottom-6 right-6 z-20">
      <button
        onClick={() => onToggle(isMapView ? 'list' : 'map')}
        className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2 font-bold text-sm border-2 border-cyan-300/50 overflow-hidden"
        style={{ boxShadow: '0 0 30px rgba(34, 217, 238, 0.4), 0 10px 40px rgba(0, 0, 0, 0.3)' }}
      >
        {/* Film grain */}
        <div className="absolute inset-0 film-grain opacity-10" />

        <div className="relative flex items-center gap-2">
          {isMapView ? (
            <>
              <List className="w-5 h-5" />
              List View
            </>
          ) : (
            <>
              <Map className="w-5 h-5" />
              Map View
            </>
          )}
        </div>
      </button>
    </div>
  );
}
