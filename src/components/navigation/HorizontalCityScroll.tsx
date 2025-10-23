import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CityData } from '../../utils/cityData';
import { cityToSlug } from '../../utils/cityData';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface HorizontalCityScrollProps {
  cities: CityData[];
  selectedCity: string | null;
  onCitySelect: (city: string) => void;
}

export function HorizontalCityScroll({ cities, selectedCity, onCitySelect }: HorizontalCityScrollProps) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    return () => container.removeEventListener('scroll', checkScroll);
  }, [cities]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 400;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (cities.length === 0) return null;

  return (
    <div className="relative bg-white border-b border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
            Browse by City
          </h2>
        </div>

        {/* Scroll Container */}
        <div className="relative group">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5 text-gray-900" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5 text-gray-900" />
            </button>
          )}

          {/* City Cards */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {cities.map((city) => {
              const isSelected = selectedCity === city.name;

              return (
                <motion.button
                  key={city.name}
                  onClick={() => {
                    onCitySelect(city.name);
                    navigate(`/city/${cityToSlug(city.name)}`);
                  }}
                  layoutId={`city-card-${city.name}`}
                  whileHover={{ scale: isSelected ? 1 : 1.02 }}
                  transition={{ duration: 0.3 }}
                  className={`
                    flex-shrink-0 snap-start group/card
                    relative overflow-hidden
                    w-72 h-96
                    ${isSelected ? 'ring-2 ring-gray-900' : ''}
                  `}
                >
                  {/* Background Image */}
                  <motion.div
                    className="absolute inset-0"
                    layoutId={`city-image-${city.name}`}
                  >
                    <motion.img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                      layoutId={`city-img-${city.name}`}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  </motion.div>

                  {/* City Info */}
                  <div className="relative h-full flex flex-col justify-end p-6">
                    <h3 className="text-3xl font-bold text-white mb-1">
                      {city.name}
                    </h3>
                    <p className="text-sm text-gray-300 uppercase tracking-wider">
                      {city.storeCount} {city.storeCount === 1 ? 'Store' : 'Stores'}
                    </p>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
