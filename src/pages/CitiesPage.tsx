import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shuffle, Train } from 'lucide-react';
import {
  MAJOR_CITIES_JAPAN,
  CITY_COLORS,
  CITY_COORDINATES,
  CITY_NAMES_JAPANESE,
  CITY_REGIONS,
} from '../lib/constants';
import { getNeighborhoodStoreCounts } from '../utils/neighborhoodData';

interface CityData {
  id: string;
  name: string;
  nameJapanese: string;
  region: string;
  storeCount: number;
  color: string;
  images: string[]; // Array of preview images for cycling
  thumbnailImage: string; // Square thumbnail for ticket cards (first image)
  coordinates: { latitude: number; longitude: number; zoom: number };
  isRandom?: boolean;
  isClone?: boolean; // Flag for cloned cards in infinite carousel
  originalId?: string; // Original city ID for clones
}

export function CitiesPage() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);
  const [storeCounts, setStoreCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Carousel state (merged from hook)
  const CLONE_COUNT = 9;
  const CARD_WIDTH = 304; // 280px + 24px gap
  const TRANSITION_MS = 300;
  const [displayIndex, setDisplayIndex] = useState(CLONE_COUNT); // Start at first real city (Random)
  const [shouldTransition, setShouldTransition] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch real store counts on mount
  useEffect(() => {
    async function fetchCounts() {
      const counts = await getNeighborhoodStoreCounts();
      setStoreCounts(counts);
      setLoading(false);
    }
    fetchCounts();
  }, []);

  // Build city list with real counts
  const cities: CityData[] = useMemo(() => {
    const items: CityData[] = [];

    // Add mystery/random city as first item
    items.push({
      id: 'random',
      name: '???',
      nameJapanese: '???',
      region: 'Mystery',
      storeCount: 0,
      color: '#A855F7', // purple
      images: ['https://via.placeholder.com/840x1000/7c3aed/ffffff?text=???'],
      thumbnailImage: 'https://via.placeholder.com/240x240/7c3aed/ffffff?text=???',
      coordinates: { latitude: 35.6895, longitude: 139.6917, zoom: 12 },
      isRandom: true,
    });

    // Add all cities
    MAJOR_CITIES_JAPAN.forEach((city) => {
      const cityStr = city as string;
      const slug = cityStr.toLowerCase().replace(/\s+/g, '').replace(/\//g, '');
      const imageSlug = cityStr === 'Kanagawa / Yokohama' ? 'yokohama' : slug;

      // Tokyo has 6 photos (tokyo1-tokyo6)
      let images: string[] = [];
      if (cityStr === 'Tokyo') {
        images = [1, 2, 3, 4, 5, 6].map(n => `/images/cities/preview/tokyo${n}-preview.jpg`);
      } else {
        images = [`/images/cities/preview/${imageSlug}-preview.jpg`];
      }
      console.log(`City: ${cityStr}, Image Slug: ${imageSlug}, Images:`, images);

      items.push({
        id: cityStr,
        name: cityStr,
        nameJapanese: CITY_NAMES_JAPANESE[cityStr] || cityStr,
        region: CITY_REGIONS[cityStr] || 'Japan',
        storeCount: storeCounts.get(cityStr) || 0,
        color: CITY_COLORS[cityStr] || '#6B7280',
        images: images,
        thumbnailImage: `/images/cities/square/${cityStr === 'Tokyo' ? 'tokyo1' : imageSlug}.jpg`,
        coordinates: CITY_COORDINATES[cityStr] || { latitude: 35.6895, longitude: 139.6917, zoom: 12 },
      });
    });

    return items;
  }, [storeCounts]);

  // Extended cities array with clones for infinite scrolling
  const extendedCities = useMemo(() => {
    const cloneCount = 9; // Clone 9 cards on each side to ensure clones are always nearby
    const leftClones = cities.slice(-cloneCount).map(city => ({
      ...city,
      isClone: true,
      originalId: city.id,
      id: `clone-left-${city.id}`,
    }));
    const rightClones = cities.slice(0, cloneCount).map(city => ({
      ...city,
      isClone: true,
      originalId: city.id,
      id: `clone-right-${city.id}`,
    }));
    return [...leftClones, ...cities, ...rightClones];
  }, [cities]);

  // Default display city (Kyoto - has images)
  const defaultCity = useMemo(() => cities.find(c => c.name === 'Kyoto') || cities.find(c => !c.isRandom) || cities[0], [cities]);

  // Display priority: selected > hovered > default
  const displayCity = selectedCity || hoveredCity || defaultCity;

  // Get current image to display
  const currentImage = displayCity?.images?.[selectedCity ? currentPhotoIndex : 0];

  // Photo cycling effect - only cycles when a city is SELECTED (not hovered)
  useEffect(() => {
    setCurrentPhotoIndex(0); // Reset to first photo when selection changes

    if (selectedCity && selectedCity.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % selectedCity.images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedCity]);

  // Handle city selection + auto-center
  const handleCitySelect = (city: CityData) => {
    const actualCityId = city.isClone ? city.originalId! : city.id;

    if (city.isRandom) {
      // Pick random city (excluding random tile)
      const realCities = cities.filter(c => !c.isRandom);
      const randomCity = realCities[Math.floor(Math.random() * realCities.length)];
      setSelectedCity(randomCity);
    } else {
      // Find the actual city from the original cities array
      const actualCity = cities.find(c => c.id === actualCityId);
      if (actualCity) {
        setSelectedCity(actualCity);
      }
    }
  };

  // Handle travel/navigate to city
  const handleTravel = (city: CityData) => {
    if (city.isRandom) return;
    const params = new URLSearchParams();
    params.set('view', 'map');
    params.set('city', city.name);
    navigate(`/map?${params.toString()}`);
  };

  // Initialize selectedCity on mount (fix initial position)
  useEffect(() => {
    if (cities.length > 0 && !selectedCity) {
      setSelectedCity(cities[0]); // Set to Random
    }
  }, [cities.length, selectedCity, cities]);

  // Calculate carousel transform
  const translateX = -displayIndex * CARD_WIDTH;

  // Arrow navigation - MERGED STATE MANAGEMENT (synchronous updates)
  const handleArrowClick = (direction: 'left' | 'right') => {
    if (isTransitioning || cities.length === 0) return;

    setIsTransitioning(true);
    setShouldTransition(true);

    // Calculate new index
    const newIndex = direction === 'right' ? displayIndex + 1 : displayIndex - 1;

    // Update display index
    setDisplayIndex(newIndex);

    // SYNCHRONOUSLY update selectedCity (no async gap!)
    const city = extendedCities[newIndex];
    if (city) {
      const actualCityId = city.isClone ? city.originalId! : city.id;
      const actualCity = cities.find(c => c.id === actualCityId);
      if (actualCity) {
        setSelectedCity(actualCity);
      }
    }

    // After animation, check if wrap-around needed
    setTimeout(() => {
      if (newIndex >= CLONE_COUNT + cities.length) {
        // Wrapped past right clones, jump to start
        setShouldTransition(false);
        setDisplayIndex(CLONE_COUNT);
      } else if (newIndex < CLONE_COUNT) {
        // Wrapped past left clones, jump to end
        setShouldTransition(false);
        setDisplayIndex(CLONE_COUNT + cities.length - 1);
      }
      setIsTransitioning(false);
    }, TRANSITION_MS);
  };

  // Safety check: if no cities loaded and loading complete, show error
  if (!loading && cities.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-cyan-300 text-xl mb-4">Unable to load cities</div>
          <div className="text-cyan-300/60 text-sm">Please refresh the page</div>
        </div>
      </div>
    );
  }

  // Safety check: if still loading, show loading screen
  if (loading || !displayCity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-cyan-300 text-xl">Loading cities...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 animate-gradient-shift" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
      </div>

      {/* Film Grain */}
      <div className="fixed inset-0 bg-[url('/film-grain.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 bg-black/40 backdrop-blur-md border border-cyan-400/30 rounded-lg px-4 py-2 flex items-center gap-2 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-200"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold">Back</span>
      </button>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Preview Section - Top 65% */}
        <div className="flex-[65] flex items-center justify-center p-6 pt-16">
          <div className="relative max-w-4xl w-full scale-90">

            {/* Large City Preview */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border-4 shadow-2xl"
              style={{
                borderColor: displayCity.color,
                boxShadow: `0 0 60px ${displayCity.color}40`,
              }}
            >
              {/* City Image with Ken Burns Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900" key={displayCity.id}>
                <img
                  src={currentImage}
                  alt={displayCity.name}
                  className="w-full h-full object-cover animate-ken-burns transition-opacity duration-500"
                  loading="eager"
                  fetchpriority="high"
                  style={{
                    imageRendering: 'auto',
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.opacity = '0';
                    const container = target.parentElement;
                    if (container && !container.querySelector('.placeholder-text')) {
                      const placeholder = document.createElement('div');
                      placeholder.className = 'placeholder-text w-full h-full flex items-center justify-center absolute inset-0';
                      placeholder.innerHTML = `
                        <div class="text-center">
                          <div class="text-8xl font-black text-white/20 mb-4">${displayCity.nameJapanese}</div>
                          <div class="text-4xl font-bold text-white/40">${displayCity.name}</div>
                          <div class="text-lg text-white/30 mt-4">Image Coming Soon</div>
                        </div>
                      `;
                      container.appendChild(placeholder);
                    }
                  }}
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.opacity = '1';
                    const container = target.parentElement;
                    if (container) {
                      const placeholder = container.querySelector('.placeholder-text');
                      if (placeholder) placeholder.remove();
                    }
                  }}
                />
              </div>

              {/* Film Grain Overlay */}
              <div className="absolute inset-0 bg-[url('/film-grain.png')] opacity-[0.05] pointer-events-none mix-blend-overlay" />

              {/* Gradient Overlay at Bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* City Info Overlay (Top Right - Mario Kart style) */}
              {displayCity && (
                <div className="absolute top-8 right-8 bg-black/60 backdrop-blur-xl border-2 rounded-xl p-6 min-w-[320px]"
                  style={{ borderColor: displayCity.color }}
                >
                  <div className="space-y-3">
                    {/* City Name */}
                    <div>
                      <h2 className="text-4xl font-black text-white tracking-tight">
                        {displayCity.name}
                      </h2>
                      <div className="text-2xl font-medium mt-1"
                        style={{ color: displayCity.color }}
                      >
                        {displayCity.nameJapanese}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <Train className="w-4 h-4" />
                        <span>{displayCity.region}</span>
                      </div>
                      {!displayCity.isRandom && (
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span>{displayCity.storeCount} Stores</span>
                        </div>
                      )}
                    </div>

                    {/* Travel Button (only for selected city) */}
                    {selectedCity && !selectedCity.isRandom && (
                      <button
                        onClick={() => handleTravel(selectedCity)}
                        className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider text-sm transition-all duration-200 shadow-lg hover:shadow-cyan-500/50 hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${selectedCity.color}, ${selectedCity.color}dd)`,
                        }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Train className="w-5 h-5" />
                          <span>Travel to {selectedCity.name}</span>
                        </div>
                      </button>
                    )}

                    {/* Mystery Hint */}
                    {selectedCity?.isRandom && (
                      <div className="text-center text-cyan-300 text-sm italic mt-4">
                        Select a city card below to reveal your destination
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hint Text (only when no selection) */}
              {!selectedCity && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                  <div className="bg-black/40 backdrop-blur-md border border-cyan-400/30 rounded-full px-6 py-3 text-cyan-300 text-sm font-medium">
                    Hover over a city ticket to preview • Click to select
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Train Line Carousel - Bottom 35% */}
        <div className="flex-[35] flex flex-col items-center justify-center px-8 pb-8">

          {/* Train Line Visual */}
          <div className="w-full max-w-6xl mb-6 scale-90">
            <div className="relative h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent">
              {/* Station Dots - ALL cities */}
              <div className="absolute inset-0 flex justify-around items-center">
                {cities.map((city) => (
                  <div
                    key={city.id}
                    className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: selectedCity?.id === city.id ? city.color : '#4B5563',
                      boxShadow: selectedCity?.id === city.id ? `0 0 12px ${city.color}` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Ticket Cards Carousel */}
          <div className="relative w-full max-w-6xl scale-90">

            {/* Scroll Buttons - Bigger */}
            <button
              onClick={() => handleArrowClick('left')}
              disabled={isTransitioning}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 backdrop-blur-md border-2 border-cyan-400/40 rounded-full p-4 text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400/60 hover:scale-110 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-7 h-7" />
            </button>
            <button
              onClick={() => handleArrowClick('right')}
              disabled={isTransitioning}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 backdrop-blur-md border-2 border-cyan-400/40 rounded-full p-4 text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400/60 hover:scale-110 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-7 h-7 rotate-180" />
            </button>

            {/* Carousel Container */}
            <div
              className="overflow-hidden"
            >
              <div
                className="flex gap-6 px-16 py-4"
                style={{
                  transform: `translateX(${translateX}px)`,
                  transition: shouldTransition ? 'transform 300ms ease-out' : 'none',
                }}
              >
                {extendedCities.map((city) => {
                  const actualCityId = city.isClone ? city.originalId! : city.id;
                  const isSelected = selectedCity?.id === actualCityId;

                  return (
                    <CityTicketCard
                      key={city.id}
                      city={city}
                      isSelected={isSelected}
                      onHover={setHoveredCity}
                      onSelect={handleCitySelect}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes ken-burns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.1) translate(-2%, -2%); }
        }

        .animate-ken-burns {
          animation: ken-burns 20s ease-in-out infinite alternate;
        }

        @keyframes gradient-shift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-5%, -5%) scale(1.1); }
        }

        .animate-gradient-shift {
          animation: gradient-shift 20s ease-in-out infinite;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Ticket Card Component
interface CityTicketCardProps {
  city: CityData;
  isSelected: boolean;
  onHover: (city: CityData | null) => void;
  onSelect: (city: CityData) => void;
}

function CityTicketCard({ city, isSelected, onHover, onSelect }: CityTicketCardProps) {
  return (
    <div
      className="relative flex-shrink-0 snap-center transition-all duration-300 cursor-pointer"
      style={{
        transform: isSelected ? 'translateY(-20px) scale(1.05)' : 'translateY(0) scale(1)',
      }}
      onMouseEnter={() => onHover(city)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(city)}
    >
      {/* Ticket Card */}
      <div
        className="w-[280px] h-[160px] rounded-xl overflow-hidden border-2 transition-all duration-300 relative"
        style={{
          borderColor: isSelected ? city.color : 'rgba(255,255,255,0.1)',
          boxShadow: isSelected
            ? `0 20px 60px ${city.color}80, 0 0 0 3px ${city.color}40`
            : '0 4px 12px rgba(0,0,0,0.3)',
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}
      >
        {/* Perforated Edge (Left Side) */}
        <div className="absolute left-0 top-0 bottom-0 w-3 flex flex-col justify-around py-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20" />
          ))}
        </div>

        {/* Card Content */}
        <div className="flex h-full">
          {/* Left: City Image (60%) */}
          <div className="flex-[6] relative ml-3 bg-gradient-to-br from-indigo-900 to-purple-900">
            <img
              src={city.thumbnailImage}
              alt={city.name}
              className="w-full h-full object-cover"
              loading="lazy"
              style={{
                imageRendering: 'auto',
              }}
              onError={(e) => {
                if (!city.isRandom) {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.errorHandled) {
                    target.dataset.errorHandled = 'true';
                    target.style.display = 'none';
                    const container = target.parentElement;
                    if (container) {
                      const placeholder = document.createElement('div');
                      placeholder.className = 'w-full h-full flex items-center justify-center absolute inset-0';
                      placeholder.innerHTML = `
                        <div class="text-center text-white/30 text-xs px-2">
                          <div class="text-2xl font-bold mb-1">${city.nameJapanese}</div>
                          <div class="text-[10px]">Coming Soon</div>
                        </div>
                      `;
                      container.appendChild(placeholder);
                    }
                  }
                }
              }}
            />
            {/* Image Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 pointer-events-none" />
          </div>

          {/* Right: City Info (40%) */}
          <div className="flex-[4] flex flex-col justify-center items-start px-4 relative z-10">
            {city.isRandom ? (
              <>
                <Shuffle className="w-8 h-8 mb-2" style={{ color: city.color }} />
                <div className="text-white font-bold text-lg">Mystery</div>
                <div className="text-gray-300 text-xs">Random City</div>
              </>
            ) : (
              <>
                <div className="text-white font-bold text-lg leading-tight mb-1">
                  {city.name}
                </div>
                <div className="text-sm font-medium mb-2" style={{ color: city.color }}>
                  {city.nameJapanese}
                </div>
                <div className="space-y-0.5 text-xs text-gray-300">
                  <div className="flex items-center gap-1">
                    <Train className="w-3 h-3" />
                    <span>{city.region}</span>
                  </div>
                  <div className="font-medium" style={{ color: city.color }}>
                    {city.storeCount} stores
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scan Line Effect (Subtle) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(transparent 50%, ${city.color}10 50%)`,
            backgroundSize: '100% 4px',
          }}
        />
      </div>

      {/* Selection Glow */}
      {isSelected && (
        <div
          className="absolute inset-0 rounded-xl blur-xl opacity-50 pointer-events-none"
          style={{
            backgroundColor: city.color,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
}
