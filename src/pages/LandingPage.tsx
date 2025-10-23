import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { FullScreenCityScroll } from '../components/landing/FullScreenCityScroll';
import { getCityDataWithCounts, type CityData } from '../utils/cityData';
import { debugCityNames } from '../utils/debugCities';

export function LandingPage() {
  const [cities, setCities] = useState<CityData[]>([]);
  const cityScrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch city data
  useEffect(() => {
    getCityDataWithCounts().then((data) => {
      console.log('City data loaded:', data);
      setCities(data);
    });

    // Debug: Show actual city names in database
    debugCityNames();
  }, []);

  const scrollToCities = () => {
    cityScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const totalStores = cities.reduce((sum, city) => sum + city.storeCount, 0);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="h-screen relative flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative text-center px-8 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            Discover Japan's
            <br />
            Best Clothing Stores
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Curated vintage, archive, and designer shops across {cities.length} major cities
            {totalStores > 0 && ` — ${totalStores} stores and counting`}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToCities}
              className="px-8 py-4 bg-white text-black text-lg font-medium hover:bg-gray-100 transition-all duration-300"
            >
              Browse by City
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-transparent text-white text-lg font-medium border-2 border-white hover:bg-white hover:text-black transition-all duration-300"
            >
              View All Stores
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToCities}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors animate-bounce"
        >
          <span className="text-sm uppercase tracking-wider">Scroll</span>
          <ChevronDown className="w-6 h-6" />
        </button>
      </section>

      {/* Full-Screen City Scroll */}
      <div ref={cityScrollRef}>
        <FullScreenCityScroll cities={cities} />
      </div>
    </div>
  );
}
