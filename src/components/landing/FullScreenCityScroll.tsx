import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { CityData } from '../../utils/cityData';

interface FullScreenCityScrollProps {
  cities: CityData[];
}

export function FullScreenCityScroll({ cities }: FullScreenCityScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  // Update active card based on scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.clientWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(newIndex);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCityClick = (cityName: string) => {
    navigate(`/map?city=${cityName}`);
  };

  if (cities.length === 0) return null;

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden">
      {/* Scroll Container */}
      <div
        ref={containerRef}
        className="h-full overflow-x-scroll overflow-y-hidden snap-x snap-mandatory flex scrollbar-hide scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {cities.map((city, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={city.name}
              className="h-full w-full flex-shrink-0 snap-center relative"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover"
                  style={{
                    transform: isActive ? 'scale(1)' : 'scale(0.95)',
                    opacity: isActive ? 1 : 0.6,
                    transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
                  }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
                {/* Ink brush overlay for a Japanese aesthetic */}
                <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-25" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1200&auto=format&fit=crop)', backgroundSize: 'cover' }} />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center px-8">
                <div
                  className="text-center"
                  style={{
                    transform: isActive ? 'translateY(0)' : 'translateY(30px)',
                    opacity: isActive ? 1 : 0.4,
                    transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
                  }}
                >
                  <h2 className="text-7xl md:text-9xl font-bold text-white mb-4 tracking-tight">
                    {city.name}
                  </h2>
                  <p className="text-xl md:text-2xl text-gray-300 uppercase tracking-widest mb-12">
                    {city.storeCount} {city.storeCount === 1 ? 'Store' : 'Stores'}
                  </p>

                  <button
                    onClick={() => handleCityClick(city.name)}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-lg font-medium hover:bg-gray-100 transition-all duration-300"
                  >
                    Explore {city.name}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* City Number Indicator */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm font-mono">
                {String(index + 1).padStart(2, '0')} / {String(cities.length).padStart(2, '0')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
        {cities.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              const container = containerRef.current;
              if (container) {
                container.scrollTo({
                  left: container.clientWidth * index,
                  behavior: 'smooth',
                });
              }
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === activeIndex
                ? 'bg-white w-8'
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Scroll Hint */}
      <div className="absolute bottom-8 right-8 text-white/50 text-sm uppercase tracking-wider hidden md:block">
        Scroll →
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
