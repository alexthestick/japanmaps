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
        className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-medium text-sm"
      >
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
      </button>
    </div>
  );
}
