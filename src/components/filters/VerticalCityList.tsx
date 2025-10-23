import { MAJOR_CITIES_JAPAN } from '../../lib/constants';

interface VerticalCityListProps {
  selectedCity: string | null;
  onCityChange: (city: string | null) => void;
}

export function VerticalCityList({ selectedCity, onCityChange }: VerticalCityListProps) {
  return (
    <div className="space-y-1 max-h-[400px] overflow-y-auto">
      {/* All Cities option */}
      <button
        onClick={() => onCityChange(null)}
        className={`
          w-full text-left px-3 py-2 rounded text-sm font-medium transition-all
          ${!selectedCity
            ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
            : 'text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        All Cities
      </button>

      {/* Individual cities */}
      {MAJOR_CITIES_JAPAN.map((city) => {
        const isSelected = selectedCity === city;
        return (
          <button
            key={city}
            onClick={() => onCityChange(city)}
            className={`
              w-full text-left px-3 py-2 rounded text-sm font-medium transition-all
              ${isSelected
                ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {city}
            {isSelected && <span className="ml-2">⭐</span>}
          </button>
        );
      })}
    </div>
  );
}
