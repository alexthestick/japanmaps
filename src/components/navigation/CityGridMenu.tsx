import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cityToSlug } from '../../utils/cityData';

interface City {
  name: string;
  storeCount: number;
  image: string;
}

interface CityGridMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCitySelect: (city: string) => void;
  cities: City[];
}

export function CityGridMenu({ isOpen, onClose, onCitySelect, cities }: CityGridMenuProps) {
  const navigate = useNavigate();
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCityClick = (cityName: string) => {
    onCitySelect(cityName);
    navigate(`/city/${cityToSlug(cityName)}`);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-95 z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Menu Content */}
      <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
        <div className="min-h-screen px-4 md:px-8 py-16 pointer-events-auto">
          {/* Header */}
          <div className="max-w-7xl mx-auto mb-12 flex items-center justify-between">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              EXPLORE CITIES
            </h1>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white hover:bg-opacity-10 rounded-full transition-all"
            >
              <X className="w-8 h-8 text-white" />
            </button>
          </div>

          {/* City Grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city, index) => (
              <button
                key={city.name}
                onClick={() => handleCityClick(city.name)}
                className="group relative overflow-hidden aspect-[4/3] bg-gray-900 hover:scale-[1.02] transition-all duration-300"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                }}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300" />
                </div>

                {/* City Info */}
                <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                    {city.name}
                  </h2>
                  <p className="text-sm text-gray-300 uppercase tracking-wider">
                    {city.storeCount} {city.storeCount === 1 ? 'Store' : 'Stores'}
                  </p>

                  {/* Hover Arrow */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <span className="text-gray-900 text-xl">→</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
