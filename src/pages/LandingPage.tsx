import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MapPin, Store, Map } from 'lucide-react';
import { FullScreenCityScroll } from '../components/landing/FullScreenCityScroll';
import { ScrollingBanner } from '../components/layout/ScrollingBanner';
import { getCityDataWithCounts, type CityData } from '../utils/cityData';
import { debugCityNames } from '../utils/debugCities';
import { supabase } from '../lib/supabase';

export function LandingPage() {
  const [cities, setCities] = useState<CityData[]>([]);
  const [totalStores, setTotalStores] = useState(0);
  const [totalNeighborhoods, setTotalNeighborhoods] = useState(0);
  const cityScrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch city data and stats
  useEffect(() => {
    // Fetch cities
    getCityDataWithCounts().then((data) => {
      console.log('City data loaded:', data);
      setCities(data);
    });

    // Fetch total stores
    supabase
      .from('stores')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => {
        if (count) setTotalStores(count);
      });

    // Fetch total unique neighborhoods
    supabase
      .from('stores')
      .select('neighborhood')
      .not('neighborhood', 'is', null)
      .then(({ data }) => {
        if (data) {
          const uniqueNeighborhoods = new Set(data.map(s => s.neighborhood));
          setTotalNeighborhoods(uniqueNeighborhoods.size);
        }
      });

    // Debug: Show actual city names in database
    debugCityNames();
  }, []);

  const scrollToCities = () => {
    cityScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Scrolling Banner */}
      <ScrollingBanner />

      {/* Hero Section */}
      <section className="h-[calc(100vh-48px)] relative flex items-center justify-center overflow-hidden">
        {/* Abstract Gradient Background (Option D) */}
        <div className="absolute inset-0">
          {/* Base gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-blue-500/20" />

          {/* Animated gradient orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl animate-gradient-shift" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-gradient-shift" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-gradient-shift" style={{ animationDelay: '4s' }} />

          {/* Map lines pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="map-lines" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                  {/* Horizontal lines */}
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#22D9EE" strokeWidth="0.5" opacity="0.5" />
                  <line x1="0" y1="100" x2="200" y2="100" stroke="#3B82F6" strokeWidth="0.5" opacity="0.5" />
                  <line x1="0" y1="150" x2="200" y2="150" stroke="#A855F7" strokeWidth="0.5" opacity="0.5" />
                  {/* Vertical lines */}
                  <line x1="50" y1="0" x2="50" y2="200" stroke="#22D9EE" strokeWidth="0.5" opacity="0.5" />
                  <line x1="100" y1="0" x2="100" y2="200" stroke="#3B82F6" strokeWidth="0.5" opacity="0.5" />
                  <line x1="150" y1="0" x2="150" y2="200" stroke="#A855F7" strokeWidth="0.5" opacity="0.5" />
                  {/* Diagonal accent lines */}
                  <line x1="0" y1="0" x2="50" y2="50" stroke="#22D9EE" strokeWidth="1" opacity="0.3" />
                  <line x1="150" y1="150" x2="200" y2="200" stroke="#A855F7" strokeWidth="1" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-lines)" />
            </svg>
          </div>

          {/* Vintage/Harajuku scattered elements */}
          <div className="absolute inset-0 opacity-10">
            {/* Cross pattern from original */}
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322D9EE' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          {/* Film grain texture */}
          <div className="absolute inset-0 film-grain" />
        </div>

        {/* Hero Content */}
        <div className="relative text-center px-8 max-w-5xl z-10">
          {/* Main Title - LOST IN TRANSIT */}
          <h1 className="text-7xl md:text-9xl font-black text-white mb-4 tracking-tight italic transform -skew-x-6"
              style={{
                textShadow: '0 0 40px rgba(34, 217, 238, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)',
                WebkitTextStroke: '2px rgba(34, 217, 238, 0.3)',
              }}>
            LOST IN TRANSIT
          </h1>

          {/* Tagline */}
          <p className="text-2xl md:text-4xl font-bold text-cyan-300 mb-4 tracking-wide">
            Discover The Best of Japan
          </p>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            A curated map of fashion, food, coffee, home goods, and museums across Japan.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/')}
            className="px-10 py-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white text-lg font-bold rounded-xl
                       hover:scale-105 hover:shadow-2xl transition-all duration-300 transform hover:-skew-x-3
                       shadow-lg border-2 border-cyan-300/50"
            style={{
              boxShadow: '0 0 30px rgba(34, 217, 238, 0.4), 0 10px 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            View All Stores
          </button>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToCities}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cyan-300/70 hover:text-cyan-300 transition-colors animate-bounce z-10"
        >
          <span className="text-sm uppercase tracking-wider font-medium">Scroll</span>
          <ChevronDown className="w-6 h-6" />
        </button>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-8 bg-gradient-to-b from-black via-gray-900 to-black">
        {/* Film grain overlay */}
        <div className="absolute inset-0 film-grain opacity-30" />

        <div className="relative max-w-6xl mx-auto">
          {/* Updated Daily Badge */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm font-medium text-cyan-300 uppercase tracking-wider">Updated Daily</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cities Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-cyan-400/30 group-hover:border-cyan-400/60 transition-all duration-300">
                {/* Corner decorations */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/50" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/50" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/50" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/50" />

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Map className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div className="text-5xl font-black text-white mb-2 italic" style={{ textShadow: '0 0 20px rgba(34, 217, 238, 0.5)' }}>
                    {cities.length}
                  </div>
                  <div className="text-lg font-medium text-gray-400 uppercase tracking-wide">Cities</div>
                </div>
              </div>
            </div>

            {/* Stores Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-blue-400/30 group-hover:border-blue-400/60 transition-all duration-300">
                {/* Corner decorations */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-blue-400/50" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-blue-400/50" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-blue-400/50" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-blue-400/50" />

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Store className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-5xl font-black text-white mb-2 italic" style={{ textShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}>
                    {totalStores}
                  </div>
                  <div className="text-lg font-medium text-gray-400 uppercase tracking-wide">Stores</div>
                </div>
              </div>
            </div>

            {/* Neighborhoods Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-purple-400/30 group-hover:border-purple-400/60 transition-all duration-300">
                {/* Corner decorations */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-purple-400/50" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-purple-400/50" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-purple-400/50" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-purple-400/50" />

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="text-5xl font-black text-white mb-2 italic" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}>
                    {totalNeighborhoods}
                  </div>
                  <div className="text-lg font-medium text-gray-400 uppercase tracking-wide">Neighborhoods</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Screen City Scroll */}
      <div ref={cityScrollRef}>
        <FullScreenCityScroll cities={cities} />
      </div>
    </div>
  );
}
