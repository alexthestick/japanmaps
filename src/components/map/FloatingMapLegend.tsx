import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MAIN_CATEGORY_COLORS } from '../../lib/constants';

export function FloatingMapLegend() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="absolute bottom-6 left-6 z-20">
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-4 min-w-[200px]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full mb-2"
        >
          <h3 className="font-semibold text-sm text-gray-900">Map Legend</h3>
          <ChevronDown
            className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? '' : 'rotate-180'}`}
          />
        </button>

        {isOpen && (
          <div className="space-y-2 text-sm">
            {Object.entries(MAIN_CATEGORY_COLORS).map(([category, color]) => (
              <div key={category} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-gray-700">{category}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
