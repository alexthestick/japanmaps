import { useNavigate } from 'react-router-dom';
import { MAJOR_CITIES_JAPAN, LOCATIONS } from '../../lib/constants';
import { cityToSlug, neighborhoodToSlug } from '../../utils/cityData';

interface HierarchicalLocationListProps {
  selectedCity: string | null;
  selectedNeighborhood: string | null;
  onCityChange: (city: string | null) => void;
  onNeighborhoodChange: (city: string, neighborhood: string | null) => void;
}

export function HierarchicalLocationList({
  selectedCity,
  selectedNeighborhood,
  onCityChange,
  onNeighborhoodChange,
}: HierarchicalLocationListProps) {
  const navigate = useNavigate();

  const handleNeighborhoodClick = (city: string, neighborhood: string) => {
    // Navigate to neighborhood page
    const citySlug = cityToSlug(city);
    const neighborhoodSlug = neighborhoodToSlug(neighborhood);
    navigate(`/city/${citySlug}/${neighborhoodSlug}`);
  };

  const handleCityClick = (city: string) => {
    // Navigate to city page
    const citySlug = cityToSlug(city);
    navigate(`/city/${citySlug}`);
  };

  return (
    <div className="space-y-1">
      {/* All Locations option */}
      <button
        onClick={() => {
          onCityChange(null);
          onNeighborhoodChange('', null);
        }}
        className={`
          w-full text-left px-3 py-2 text-sm font-medium transition-all uppercase tracking-wide rounded-lg
          ${!selectedCity
            ? 'text-white font-bold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50'
            : 'text-gray-300 hover:text-cyan-300 hover:bg-gray-800'
          }
        `}
        style={!selectedCity ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
      >
        All Locations
      </button>

      {/* Cities with their neighborhoods */}
      {MAJOR_CITIES_JAPAN.map((city) => {
        const cityStr = city as string;
        const neighborhoods = LOCATIONS[cityStr] || [];
        const isCitySelected = selectedCity === cityStr;

        return (
          <div key={cityStr} className="py-1">
            {/* City Name (bold, larger) */}
            <button
              onClick={() => handleCityClick(cityStr)}
              className={`
                w-full text-left px-3 py-2 text-sm font-bold transition-all uppercase tracking-wide rounded-lg
                ${isCitySelected && !selectedNeighborhood
                  ? 'text-white bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50'
                  : isCitySelected
                  ? 'text-cyan-200'
                  : 'text-gray-300 hover:text-cyan-300 hover:bg-gray-800'
                }
              `}
              style={isCitySelected && !selectedNeighborhood ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' } : {}}
            >
              {cityStr}
            </button>

            {/* Neighborhoods (indented, smaller) */}
            {neighborhoods.length > 0 && (
              <div className="ml-3 mt-0.5 space-y-0.5">
                {neighborhoods.map((neighborhood) => {
                  const isNeighborhoodSelected =
                    selectedCity === cityStr && selectedNeighborhood === neighborhood;

                  return (
                    <button
                      key={neighborhood}
                      onClick={() => handleNeighborhoodClick(cityStr, neighborhood)}
                      className={`
                        w-full text-left px-2 py-1 text-xs transition-all rounded
                        ${isNeighborhoodSelected
                          ? 'text-cyan-300 font-bold bg-cyan-500/10'
                          : 'text-gray-300 hover:text-cyan-300 hover:bg-gray-800 font-normal'
                        }
                      `}
                    >
                      {neighborhood}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
