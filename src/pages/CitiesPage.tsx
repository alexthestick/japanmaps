import { useState, useEffect, useMemo, useRef, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shuffle, Train } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  MAJOR_CITIES_JAPAN,
  CITY_COLORS,
  CITY_COORDINATES,
  CITY_NAMES_JAPANESE,
  CITY_REGIONS,
} from '../lib/constants';
import { getNeighborhoodStoreCounts } from '../utils/neighborhoodData';
import { useCityStorePreviews } from '../hooks/useCityStorePreviews';
import type { Store } from '../types/store';

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
  regionColor?: string; // Regional color accent for Phase 7b
}

// StorePreviewCard Component - Memoized for performance
interface StorePreviewCardProps {
  store: Store | null;
  category: string;
  icon: string;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  cityColor: string;
}

const StorePreviewCard = memo(function StorePreviewCard({
  store,
  category,
  icon,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  cityColor,
}: StorePreviewCardProps) {
  return (
    <div
      className="aspect-square w-full rounded-lg overflow-hidden relative bg-black/20 cursor-pointer group"
      style={{
        clipPath: 'polygon(0 5%, 100% 0, 100% 95%, 0 100%)',
        willChange: 'transform, border-color, box-shadow',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        border: `3px solid ${cityColor}`,
        boxShadow: isHovered
          ? `0 0 30px ${cityColor}80, 0 0 60px ${cityColor}40, inset 0 0 20px ${cityColor}20`
          : `0 0 15px ${cityColor}40, inset 0 0 10px ${cityColor}15`,
        transition: 'border-color 200ms ease-out, box-shadow 200ms ease-out, transform 200ms ease-out',
        transform: isHovered ? 'scale(1.02) translateY(-2px)' : 'scale(1)',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {store && store.photos && store.photos.length > 0 ? (
        <>
          <img
            src={store.photos[0]}
            alt={store.name}
            className="w-full h-full object-cover"
            style={{
              transition: 'transform 200ms ease-out, opacity 200ms ease-out',
              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
            }}
            loading="eager"
            fetchPriority="high"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.opacity = '0';
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Category Icon Pill - Enhanced Kirby Style */}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md p-1.5 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: cityColor,
              boxShadow: `0 0 16px ${cityColor}60, inset 0 0 8px ${cityColor}30`,
              width: '32px',
              height: '32px',
              transition: 'all 200ms ease-out',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <span className="text-lg">{icon}</span>
          </div>

          {/* Store Name Overlay - Hover Show - Enhanced */}
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent"
            style={{
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 200ms ease-out',
            }}
          >
            <div className="text-xs font-bold text-white uppercase tracking-wide line-clamp-2"
              style={{
                textShadow: `0 0 12px ${cityColor}80, 0 2px 8px rgba(0,0,0,0.8), 0 0 4px ${cityColor}50`,
                letterSpacing: '0.05em',
              }}
            >
              {store.name}
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-cyan-300/30 text-xs font-serif italic">
          {icon} No stores
        </div>
      )}
    </div>
  );
});

// Phase 7b: Regional Color System
const REGION_COLOR_PALETTE: { [key: string]: { primary: string; accent: string; glow: string } } = {
  'Hokkaido': {
    primary: '#00d4ff', // Cool cyan
    accent: '#0088ff', // Ice blue
    glow: 'rgba(0, 212, 255, 0.4)',
  },
  'Kanto': {
    primary: '#ff00ff', // Electric magenta
    accent: '#d946ef', // Violet
    glow: 'rgba(255, 0, 255, 0.3)',
  },
  'Kansai': {
    primary: '#ffa500', // Warm amber
    accent: '#ffb84d', // Gold
    glow: 'rgba(255, 165, 0, 0.3)',
  },
  'Chugoku': {
    primary: '#00ffaa', // Teal-green
    accent: '#20c997', // Emerald
    glow: 'rgba(0, 255, 170, 0.3)',
  },
  'Kyushu': {
    primary: '#ff1493', // Pink-red
    accent: '#ff69b4', // Hot pink
    glow: 'rgba(255, 20, 147, 0.3)',
  },
};

// StorePreviews Component - Fetches and renders store cards
interface StorePreviewsProps {
  cityName: string;
  hoveredCardIndex: number | null;
  handleCardMouseEnter: (index: number) => void;
  handleCardMouseLeave: () => void;
  cityColor: string;
}

function StorePreviews({ cityName, hoveredCardIndex, handleCardMouseEnter, handleCardMouseLeave, cityColor }: StorePreviewsProps) {
  const { previews, loading } = useCityStorePreviews(cityName);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 w-full">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-square w-full rounded-lg bg-gradient-to-br from-cyan-400/20 to-cyan-400/5 border border-cyan-400/20 animate-pulse"
            style={{
              clipPath: 'polygon(0 3%, 100% 0, 100% 97%, 0 100%)',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {previews.slice(0, 6).map((preview, idx) => (
        <StorePreviewCard
          key={idx}
          store={preview.store}
          category={preview.category}
          icon={preview.icon}
          isHovered={hoveredCardIndex === idx}
          onMouseEnter={() => handleCardMouseEnter(idx)}
          onMouseLeave={handleCardMouseLeave}
          cityColor={cityColor}
        />
      ))}
    </div>
  );
}

export function CitiesPage() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);
  const [storeCounts, setStoreCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isTransitioning, setIsTransitioningState] = useState(false); // Phase 8: Travel transition state
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null); // New state for hovered card index

  // Image loading state management
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Landing state management
  const [isLandingMode, setIsLandingMode] = useState(true);

  // Carousel state (merged from hook)
  const CLONE_COUNT = 9;
  const CARD_WIDTH = 320; // 280px + 40px gap
  const TRANSITION_MS = 300;
  const [displayIndex, setDisplayIndex] = useState(CLONE_COUNT); // Start at first real city (Random)
  const [shouldTransition, setShouldTransition] = useState(true);
  const [isCarouselTransitioning, setIsCarouselTransitioning] = useState(false);

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
      const regionName = CITY_REGIONS[cityStr] || 'Japan';
      const regionPalette = REGION_COLOR_PALETTE[regionName] || REGION_COLOR_PALETTE['Kanto'];

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
        region: regionName,
        storeCount: storeCounts.get(cityStr) || 0,
        color: CITY_COLORS[cityStr] || '#6B7280',
        images: images,
        thumbnailImage: `/images/cities/square/${cityStr === 'Tokyo' ? 'tokyo1' : imageSlug}.jpg`,
        coordinates: CITY_COORDINATES[cityStr] || { latitude: 35.6895, longitude: 139.6917, zoom: 12 },
        regionColor: regionPalette.primary, // Phase 7b: Regional color accent
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
  const currentImage = displayCity?.images?.[selectedCity ? currentPhotoIndex : 0] || 
                       (displayCity?.isRandom ? 'https://via.placeholder.com/1200x750/7c3aed/ffffff?text=???' : '');

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

  // Preload next image in cycle for smooth transitions
  useEffect(() => {
    if (selectedCity && selectedCity.images && selectedCity.images.length > 1) {
      const nextIndex = (currentPhotoIndex + 1) % selectedCity.images.length;
      const nextImageUrl = selectedCity.images[nextIndex];
      
      if (nextImageUrl) {
        const img = new Image();
        img.src = nextImageUrl;
      }
    }
  }, [currentPhotoIndex, selectedCity]);

  // Landing mode slideshow - auto-cycle mystery city images
  useEffect(() => {
    if (isLandingMode && displayCity?.isRandom && displayCity?.images?.length > 1) {
      const slideInterval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % displayCity.images.length);
      }, 4000); // 4 second interval for smooth slideshow
      
      return () => clearInterval(slideInterval);
    }
  }, [isLandingMode, displayCity]);

  // Handle city selection + auto-center
  const handleCitySelect = (city: CityData, clickedIndex?: number) => {
    setSelectedCity(city);
    setIsLandingMode(false); // Exit landing mode on city selection
    setCurrentPhotoIndex(0);

    const actualCityId = city.isClone ? city.originalId! : city.id;

    if (city.isRandom) {
      // Pick random city (excluding random tile)
      const realCities = cities.filter(c => !c.isRandom);
      const randomCity = realCities[Math.floor(Math.random() * realCities.length)];
      setSelectedCity(randomCity);

      // Find the real city index in the original cities array
      const realCityIndex = cities.findIndex(c => c.id === randomCity.id);
      if (realCityIndex !== -1) {
        // Convert to extended array index (real cities start at CLONE_COUNT)
        const targetIndex = CLONE_COUNT + realCityIndex;
        setShouldTransition(true);
        setDisplayIndex(targetIndex);
      }
    } else {
      // Find the actual city from the original cities array
      const actualCity = cities.find(c => c.id === actualCityId);
      if (actualCity) {
        setSelectedCity(actualCity);

        // Find the real city index (not clone) in the original cities array
        const realCityIndex = cities.findIndex(c => c.id === actualCityId);
        if (realCityIndex !== -1) {
          // Convert to extended array index (real cities start at CLONE_COUNT)
          // This ensures we ALWAYS center on the real city (indices 9-21), never clones
          const targetIndex = CLONE_COUNT + realCityIndex;
          setShouldTransition(true);
          setDisplayIndex(targetIndex);
        }
      }
    }
  };

  // Handle travel/navigate to city - Phase 8: Cinematic transition
  const handleTravel = (city: CityData) => {
    if (city.isRandom) return;
    setIsTransitioningState(true);

    // Trigger warp effect and fade out
    setTimeout(() => {
      const params = new URLSearchParams();
      params.set('view', 'map');
      params.set('city', city.name);
      navigate(`/map?${params.toString()}`);
    }, 600); // Allow warp animation to play
  };

  // Handlers for store card hover - stable references for memoized components
  const handleCardMouseEnter = useCallback((index: number) => {
    setHoveredCardIndex(index);
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    setHoveredCardIndex(null);
  }, []);

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
    if (isCarouselTransitioning || cities.length === 0) return;

    setIsCarouselTransitioning(true);
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
        
        // Check if mystery card - enter landing mode or exit
        if (actualCity.isRandom) {
          setIsLandingMode(true);
          setCurrentPhotoIndex(0);
        } else {
          setIsLandingMode(false);
        }
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
      setIsCarouselTransitioning(false);
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
    <div className="min-h-screen relative overflow-hidden"
         style={{
           background: `
             radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15), transparent 50%),
             radial-gradient(ellipse at bottom left, rgba(168, 85, 247, 0.15), transparent 50%),
             linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 50%, #581c87 100%)
           `
         }}>

      {/* Volumetric Light Rays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-1 h-96 bg-gradient-to-b from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 blur-xl"
             style={{ left: '20%', top: '-10%', rotate: '25deg', animation: 'float-ray 25s ease-in-out infinite' }} />
        <div className="absolute w-1 h-96 bg-gradient-to-b from-purple-400/0 via-purple-400/15 to-purple-400/0 blur-xl"
             style={{ left: '70%', top: '-5%', rotate: '-20deg', animation: 'float-ray 30s ease-in-out infinite 5s' }} />
        <div className="absolute w-1 h-96 bg-gradient-to-b from-pink-400/0 via-pink-400/10 to-pink-400/0 blur-xl"
             style={{ left: '50%', top: '-15%', rotate: '15deg', animation: 'float-ray 35s ease-in-out infinite 10s' }} />
      </div>

      {/* Bokeh Particles & Floating Glints - Phase 10: Enhanced ambient motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft bokeh particles */}
        <div className="absolute w-3 h-3 rounded-full bg-white/10 blur-sm"
             style={{ left: '15%', top: '20%', animation: 'float-particle 12s ease-in-out infinite' }} />
        <div className="absolute w-2 h-2 rounded-full bg-cyan-300/15 blur-sm"
             style={{ left: '80%', top: '40%', animation: 'float-particle 15s ease-in-out infinite 3s' }} />
        <div className="absolute w-4 h-4 rounded-full bg-purple-300/10 blur-sm"
             style={{ left: '60%', top: '70%', animation: 'float-particle 18s ease-in-out infinite 6s' }} />
        <div className="absolute w-2 h-2 rounded-full bg-pink-300/12 blur-sm"
             style={{ left: '30%', top: '60%', animation: 'float-particle 20s ease-in-out infinite 9s' }} />
        <div className="absolute w-3 h-3 rounded-full bg-blue-300/10 blur-sm"
             style={{ left: '90%', top: '25%', animation: 'float-particle 14s ease-in-out infinite 4s' }} />
        <div className="absolute w-2 h-2 rounded-full bg-cyan-200/10 blur-sm"
             style={{ left: '25%', top: '35%', animation: 'float-particle 16s ease-in-out infinite 2s' }} />
        <div className="absolute w-3 h-3 rounded-full bg-purple-200/8 blur-sm"
             style={{ left: '70%', top: '80%', animation: 'float-particle 22s ease-in-out infinite 7s' }} />
        <div className="absolute w-2 h-2 rounded-full bg-pink-200/10 blur-sm"
             style={{ left: '45%', top: '15%', animation: 'float-particle 19s ease-in-out infinite 5s' }} />
        <div className="absolute w-4 h-4 rounded-full bg-blue-200/8 blur-sm"
             style={{ left: '85%', top: '65%', animation: 'float-particle 17s ease-in-out infinite 8s' }} />
        <div className="absolute w-2 h-2 rounded-full bg-white/8 blur-sm"
             style={{ left: '10%', top: '75%', animation: 'float-particle 21s ease-in-out infinite 11s' }} />

        {/* Phase 10: Floating light glints (faster, more subtle) */}
        <div className="absolute w-1 h-1 rounded-full bg-cyan-200/20 blur-md"
             style={{ left: '35%', top: '45%', animation: 'float-glint 8s ease-in-out infinite' }} />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-purple-300/15 blur-md"
             style={{ left: '65%', top: '25%', animation: 'float-glint 10s ease-in-out infinite 2s' }} />
        <div className="absolute w-1 h-1 rounded-full bg-pink-200/15 blur-md"
             style={{ left: '50%', top: '60%', animation: 'float-glint 9s ease-in-out infinite 1s' }} />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300/15 blur-md"
             style={{ left: '20%', top: '55%', animation: 'float-glint 11s ease-in-out infinite 3s' }} />
        <div className="absolute w-1 h-1 rounded-full bg-blue-200/15 blur-md"
             style={{ left: '75%', top: '35%', animation: 'float-glint 8.5s ease-in-out infinite 1.5s' }} />
      </div>

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20"
             style={{ animation: 'gradient-shift 20s ease-in-out infinite' }} />
      </div>

      {/* Film Grain */}
      <div className="fixed inset-0 bg-[url('/film-grain.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* Back Button - Enhanced HUD Style */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-50 bg-black/40 backdrop-blur-md border border-cyan-400/30 rounded-lg px-4 py-2 flex items-center gap-2 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-200 font-display uppercase tracking-wide text-sm"
        style={{
          boxShadow: '0 0 20px rgba(34, 211, 238, 0.2), inset 0 0 30px rgba(0,0,0,0.3)',
        }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold">Back</span>
      </button>

      {/* Main Content - Train Arrival Animation */}
      <motion.div
        className="relative z-10 min-h-screen flex flex-col"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '-100%', opacity: 0 }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 120,
          duration: 0.8,
        }}
      >

        {/* Phase 1a: CITIES Masthead Section - Branding Header - Kirby UE RIDE Inspired */}
        <div className="relative z-20 px-8 pt-2 pb-2 overflow-hidden"
          style={{
            clipPath: 'polygon(0 0, 100% 3%, 100% 100%, 0 97%)',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.3))',
            backdropFilter: 'blur(10px)',
            borderBottom: '2px solid rgba(34, 211, 238, 0.3)',
            minHeight: '140px',
          }}
        >
          <div className="max-w-6xl mx-auto relative z-10 h-full flex items-center justify-between">
            {/* Left: Vertical Japanese Text */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-cyan-300/40 font-serif text-sm tracking-wider"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'upright',
                letterSpacing: '0.1em',
              }}
            >
              日本の街を巡る旅
            </div>

            {/* Center: MASSIVE CITIES Text - Fills vertical space */}
            <div className="flex-1 flex items-center pl-8">
              <h1 className="font-black text-white font-display"
                style={{
                  fontSize: 'clamp(5rem, 11vw, 8.5rem)',
                  textShadow: `0 0 30px rgba(34, 211, 238, 0.4), 0 0 20px ${displayCity.regionColor || displayCity.color}40, 0 4px 12px rgba(0,0,0,0.6)`,
                  letterSpacing: '0.2em',
                  WebkitTextStroke: '1.5px rgba(34, 211, 238, 0.4)',
                  paintOrder: 'stroke fill',
                  lineHeight: '0.95',
                  margin: 0,
                  padding: 0,
                }}
              >
                CITIES
              </h1>
            </div>

            {/* Right: Mini Carousel Ticket Card */}
            {displayCity && (
              <div
                className="rounded-lg overflow-hidden transition-all duration-300 relative backdrop-blur-md flex-shrink-0"
                style={{
                  width: '240px',
                  height: '130px',
                  border: `3px solid ${displayCity.regionColor || displayCity.color}`,
                  boxShadow: `0 0 30px ${displayCity.regionColor || displayCity.color}60, 0 0 15px ${displayCity.regionColor || displayCity.color}40, inset 0 0 20px rgba(0,0,0,0.4)`,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Perforated Edge (Left Side) */}
                <div className="absolute left-0 top-0 bottom-0 w-2.5 flex flex-col justify-around py-1.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-white/20" />
                  ))}
                </div>

                {/* Card Content */}
                <div className="flex h-full">
                  {/* Left: City Image (55%) */}
                  <div className="flex-[55] relative ml-2.5 bg-gradient-to-br from-indigo-900 to-purple-900">
                    <img
                      src={displayCity.thumbnailImage}
                      alt={displayCity.name}
                      className="w-full h-full object-cover"
                      loading="eager"
                      onError={(e) => {
                        if (!displayCity.isRandom) {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 pointer-events-none" />
                  </div>

                  {/* Right: City Info (45%) */}
                  <div className="flex-[45] flex flex-col justify-center items-start px-3 relative z-10">
                    {!displayCity.isRandom ? (
                      <>
                        <div className="text-white font-black text-lg leading-tight mb-0.5 font-display uppercase"
                          style={{
                            textShadow: `0 0 12px ${displayCity.regionColor || displayCity.color}80, 0 1px 3px rgba(0,0,0,0.8)`,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {displayCity.name}
                        </div>
                        <div className="text-xs font-medium mb-1.5 font-sans"
                          style={{
                            color: displayCity.regionColor || displayCity.color,
                            textShadow: `0 0 8px ${displayCity.regionColor || displayCity.color}60`,
                            letterSpacing: '0.05em',
                          }}
                        >
                          {displayCity.nameJapanese}
                        </div>
                        <div className="flex flex-col gap-1 text-[10px] font-sans">
                          <div className="px-2 py-0.5 rounded-full bg-black/50 border"
                            style={{
                              borderColor: `${displayCity.regionColor || displayCity.color}70`,
                              color: displayCity.regionColor || displayCity.color,
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              boxShadow: `0 0 8px ${displayCity.regionColor || displayCity.color}30`,
                            }}
                          >
                            {displayCity.region}
                          </div>
                          <div className="px-2 py-0.5 rounded-full bg-black/50 border"
                            style={{
                              borderColor: `${displayCity.regionColor || displayCity.color}70`,
                              color: displayCity.regionColor || displayCity.color,
                              fontWeight: '700',
                              letterSpacing: '0.05em',
                              boxShadow: `0 0 8px ${displayCity.regionColor || displayCity.color}30`,
                            }}
                          >
                            ⭐ {displayCity.storeCount}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-white font-black text-base font-display uppercase">Mystery</div>
                    )}
                  </div>
                </div>

                {/* Scan Line Effect */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(transparent 50%, ${displayCity.regionColor || displayCity.color}08 50%)`,
                    backgroundSize: '100% 3px',
                  }}
                />
              </div>
            )}
          </div>

          {/* THICC Diagonal Accent Stripe - Bottom of masthead */}
          <div className="absolute bottom-0 left-0 right-0 h-10"
            style={{
              background: `linear-gradient(90deg, ${displayCity.regionColor || displayCity.color}50, ${displayCity.regionColor || displayCity.color}90, ${displayCity.regionColor || displayCity.color}50)`,
              boxShadow: `0 0 40px ${displayCity.regionColor || displayCity.color}80, 0 0 20px ${displayCity.regionColor || displayCity.color}60, inset 0 0 20px ${displayCity.regionColor || displayCity.color}40`,
              transform: 'skewY(-2deg)',
              transition: 'all 300ms ease-in-out',
            }}
          />
        </div>

        {/* Phase 1b: Hero Section - 60/40 Split Container */}
        <div className="flex flex-1 overflow-visible items-start"
          style={{
            clipPath: 'polygon(0 0, 100% 3%, 100% 97%, 0 100%)',
          }}
        >
          {/* Left side: Preview - Flexible Width */}
          <div className={`${isLandingMode ? 'w-full' : 'flex-[78]'} flex min-w-0 items-start justify-center p-4 pb-20 overflow-visible`}>
          <div className={`relative ${isLandingMode ? 'w-full' : 'max-w-6xl'} w-full h-full flex items-start justify-center`}>

            {/* Glow Container */}
            <div className={`relative w-full aspect-[16/10] ${isLandingMode ? 'max-w-7xl' : ''}`}
              style={{
                transform: `scale(${isLandingMode ? 1 : 0.95})`,
                transition: 'transform 400ms ease-out',
              }}
            >
              {/* Atmospheric Glow Behind Preview - Phase 7b: Regional color with smooth transitions */}
              <div
                className="absolute inset-0 rounded-2xl blur-2xl opacity-35 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at center, ${displayCity.regionColor || displayCity.color}60, transparent 70%)`,
                  transition: 'background 0.3s ease-in-out',
                }}
              />

              {/* Chunky Nintendo Border Glow - Phase 7b: Dynamic regional color */}
              <div
                className="absolute inset-1 rounded-2xl opacity-70 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${displayCity.regionColor || displayCity.color}, ${displayCity.regionColor || displayCity.color}80)`,
                  filter: 'blur(4px)',
                  transition: 'background 0.3s ease-in-out',
                }}
              />

              {/* Large City Preview */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  border: `5px solid rgba(34, 211, 238, 0.9)`,
                  boxShadow: `0 0 80px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.3), inset 0 0 60px rgba(0,0,0,0.4), inset 0 6px 15px rgba(255,255,255,0.15)`,
                  transition: 'border 300ms ease-in-out, box-shadow 300ms ease-in-out',
                }}
              >
              {/* City Image with Ken Burns Effect */}
              <img
                src={currentImage}
                alt={displayCity.name}
                className="w-full h-full object-cover animate-ken-burns transition-opacity duration-500"
                loading="eager"
                fetchPriority="high"
                style={{
                  imageRendering: 'auto',
                  opacity: imageError ? 0 : 1,
                  transition: 'opacity 300ms ease-in-out',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  setImageError(true);
                  target.style.opacity = '0';
                  const container = target.parentElement;
                  if (container && !container.querySelector('.placeholder-text')) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'placeholder-text w-full h-full flex items-center justify-center absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900';
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
                  setImageError(false);
                  setImageLoading(false);
                  target.style.opacity = '1';
                  const container = target.parentElement;
                  if (container) {
                    const placeholder = container.querySelector('.placeholder-text');
                    if (placeholder) placeholder.remove();
                  }
                }}
              />

              {/* Film Grain Overlay */}
              <div className="absolute inset-0 bg-[url('/film-grain.png')] opacity-[0.05] pointer-events-none mix-blend-overlay" />

              {/* Gradient Overlay at Bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Train Travel Button - Bottom Center with Kirby Aesthetic - Visible for ALL cities */}
              {selectedCity && (
                <button
                  onClick={() => handleTravel(selectedCity)}
                  className="absolute text-white font-black uppercase tracking-wider text-lg font-display relative overflow-hidden group active:scale-95 disabled:opacity-50 px-12 py-4 transition-all duration-300"
                  disabled={isTransitioning}
                  style={{
                    bottom: '60px',
                    left: '50%',
                    transform: isTransitioning ? 'scale(0.9) translateY(5px) translateX(-50%)' : 'scale(1) translateY(0) translateX(-50%)',
                    clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)',
                    background: `linear-gradient(135deg, ${selectedCity.regionColor || selectedCity.color}, ${selectedCity.regionColor || selectedCity.color}dd)`,
                    border: `4px solid ${selectedCity.regionColor || selectedCity.color}`,
                    boxShadow: `0 0 60px ${selectedCity.regionColor || selectedCity.color}80, 0 0 30px ${selectedCity.regionColor || selectedCity.color}60, 0 12px 40px rgba(0,0,0,0.6), inset 0 0 40px rgba(255,255,255,0.15)`,
                    transition: isTransitioning
                      ? 'all 0.6s ease-in-out'
                      : 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    opacity: isTransitioning ? 0.7 : 1,
                    zIndex: 100,
                  }}
                  onMouseEnter={(e) => {
                    if (!isTransitioning) {
                      e.currentTarget.style.transform = 'scale(1.12) translateY(-5px) translateX(-50%)';
                      e.currentTarget.style.boxShadow = `0 0 80px ${selectedCity.regionColor || selectedCity.color}90, 0 0 40px ${selectedCity.regionColor || selectedCity.color}80, 0 16px 50px rgba(0,0,0,0.7), inset 0 0 50px rgba(255,255,255,0.2)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isTransitioning) {
                      e.currentTarget.style.transform = 'scale(1) translateY(0) translateX(-50%)';
                      e.currentTarget.style.boxShadow = `0 0 60px ${selectedCity.regionColor || selectedCity.color}80, 0 0 30px ${selectedCity.regionColor || selectedCity.color}60, 0 12px 40px rgba(0,0,0,0.6), inset 0 0 40px rgba(255,255,255,0.15)`;
                    }
                  }}
                >
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)' }} />
                  
                  {/* Warp effect when transitioning */}
                  {isTransitioning && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)' }} />
                  )}
                  
                  {/* Button Content */}
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <Train className="w-6 h-6" style={{ filter: `drop-shadow(0 0 8px ${selectedCity.regionColor || selectedCity.color})` }} />
                    <span style={{ textShadow: `0 0 12px ${selectedCity.regionColor || selectedCity.color}80, 0 3px 8px rgba(0,0,0,0.9)` }}>
                      {isTransitioning ? 'DEPARTING...' : `TRAVEL TO ${selectedCity.name.toUpperCase()}`}
                    </span>
                  </div>
                </button>
              )}

              {/* Landing Mode Message */}
              {isLandingMode && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    opacity: isLandingMode ? 1 : 0,
                    transition: 'opacity 300ms ease-out',
                  }}
                >
                  <div className="text-center">
                    <h2 className="text-5xl font-black text-white/90 mb-4">Select a City</h2>
                    <p className="text-xl text-white/70">to explore stores and neighborhoods</p>
                  </div>
                </div>
              )}

              {/* Hint Text (only when no selection) */}
              {!selectedCity && (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
                  <div className="bg-black/40 backdrop-blur-md border border-cyan-400/30 rounded-full px-6 py-3 text-cyan-300 text-sm font-medium font-sans"
                    style={{
                      boxShadow: '0 0 20px rgba(34, 211, 238, 0.2), inset 0 0 30px rgba(0,0,0,0.3)',
                      animation: 'pulse-glow 3s ease-in-out infinite',
                    }}
                  >
                    Hover over a city ticket to preview • Click to select
                  </div>
                </div>
              )}
            </div>
          </div>
            </div>
          {/* Right side: Store Preview Section - Real store data integration */}
          <div className={`flex-[22] flex flex-col items-start justify-start pl-2 pr-2 pt-2 pb-0 relative transition-all duration-300 h-full ${isLandingMode ? '' : 'flex-[22]'}`}
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.2))',
              borderLeft: '3px solid rgba(34, 211, 238, 0.2)',
              opacity: isLandingMode ? 0 : 1,
              transform: isLandingMode ? 'translateX(40px)' : 'translateX(0)',
              transition: 'all 400ms ease-out 200ms',
              pointerEvents: isLandingMode ? 'none' : 'auto',
              visibility: isLandingMode ? 'hidden' : 'visible',
            }}
          >
            {/* Store Preview Grid - Now starts at top, aligned with preview panel */}
            <div className="w-full flex flex-col">
              <h4 className="text-xs font-display uppercase tracking-widest text-cyan-300/40 pb-2 mb-2 flex-shrink-0">Featured</h4>

              {/* Fetch and display real store data */}
              {displayCity && !displayCity.isRandom && (
                <StorePreviews cityName={displayCity.name} hoveredCardIndex={hoveredCardIndex} handleCardMouseEnter={handleCardMouseEnter} handleCardMouseLeave={handleCardMouseLeave} cityColor={displayCity.regionColor || displayCity.color} />
              )}

              {/* Mystery city - no stores */}
              {displayCity?.isRandom && (
                <div className="w-full h-full flex items-center justify-center text-cyan-300/20 text-xs font-serif italic">
                  Select a city to see stores
                </div>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Train Line Carousel - Below Hero Section */}
        <div className="flex-none flex flex-col items-center justify-center px-8 pb-8 pt-8"
          style={{
            height: 'auto',
            minHeight: '300px',
            opacity: isTransitioning ? 0.5 : 1,
            transition: 'opacity 0.6s ease-in-out',
          }}
        >

          {/* Train Line Visual - Enhanced Travel Route */}
          <div className="w-full max-w-6xl mb-10 scale-90">
            <div className="relative h-2 rounded-full overflow-visible">
              {/* Base rail with gradient */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
                style={{
                  boxShadow: '0 0 20px rgba(34, 211, 238, 0.25), inset 0 1px 2px rgba(255,255,255,0.1)',
                }}
              />

              {/* Animated energy flow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent"
                style={{
                  animation: 'rail-flow 3s linear infinite',
                  backgroundSize: '200% 100%',
                }}
              />

              {/* Station Dots - ALL cities - Phase 10: Enhanced hover reactions & Phase 7b regional colors */}
              <div className="absolute inset-0 flex justify-around items-center">
                {cities.map((city, idx) => {
                  const isActive = selectedCity?.id === city.id;
                  const cityIndex = cities.findIndex(c => c.id === city.id);
                  const selectedIndex = cities.findIndex(c => c.id === selectedCity?.id);
                  const isConnected = selectedIndex !== -1 &&
                    ((cityIndex < selectedIndex) || (cityIndex === selectedIndex));

                  return (
                    <StationDot
                      key={city.id}
                      city={city}
                      isActive={isActive}
                      cityIndex={cityIndex}
                      isConnected={isConnected}
                      previousCity={cityIndex > 0 ? cities[cityIndex - 1] : null}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ticket Cards Carousel */}
          <div className="relative w-full max-w-6xl scale-90">

            {/* Navigation Buttons - Circular Neon Station Controls */}
            <button
              onClick={() => handleArrowClick('left')}
              disabled={isCarouselTransitioning}
              className="absolute -left-20 top-1/2 -translate-y-1/2 z-10 group disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
            >
              {/* Outer neon ring */}
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 group-hover:border-cyan-400/80 transition-all duration-300"
                style={{
                  boxShadow: '0 0 20px rgba(34, 211, 238, 0.2), inset 0 0 20px rgba(0,0,0,0.6)',
                }}
              />
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(circle, rgba(34, 211, 238, 0.2), transparent 70%)',
                  filter: 'blur(15px)',
                }}
              />
              {/* Button content */}
              <div className="relative w-14 h-14 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-full group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                <ArrowLeft className="w-6 h-6 text-cyan-300 group-hover:text-cyan-200 transition-colors" />
              </div>
            </button>

            <button
              onClick={() => handleArrowClick('right')}
              disabled={isCarouselTransitioning}
              className="absolute -right-20 top-1/2 -translate-y-1/2 z-10 group disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
            >
              {/* Outer neon ring */}
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 group-hover:border-cyan-400/80 transition-all duration-300"
                style={{
                  boxShadow: '0 0 20px rgba(34, 211, 238, 0.2), inset 0 0 20px rgba(0,0,0,0.6)',
                }}
              />
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(circle, rgba(34, 211, 238, 0.2), transparent 70%)',
                  filter: 'blur(15px)',
                }}
              />
              {/* Button content */}
              <div className="relative w-14 h-14 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-full group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                <ArrowLeft className="w-6 h-6 text-cyan-300 group-hover:text-cyan-200 transition-colors rotate-180" />
              </div>
            </button>

            {/* Carousel Container - Extra vertical space for selected card */}
            <div
              className="overflow-hidden"
              style={{
                paddingTop: '60px',
                paddingBottom: '40px',
                marginTop: '-40px',
              }}
            >
              <div
                className="flex gap-10 px-16"
                style={{
                  transform: `translateX(${translateX}px)`,
                  transition: shouldTransition ? 'transform 400ms cubic-bezier(0.34, 1.26, 0.64, 1)' : 'none',
                }}
              >
                {extendedCities.map((city, index) => {
                  const actualCityId = city.isClone ? city.originalId! : city.id;
                  const isSelected = selectedCity?.id === actualCityId;

                  // Calculate distance from center for depth of field effect
                  const distanceFromCenter = Math.abs(index - displayIndex);

                  return (
                    <CityTicketCard
                      key={city.id}
                      city={city}
                      isSelected={isSelected}
                      distanceFromCenter={distanceFromCenter}
                      onHover={setHoveredCity}
                      onSelect={() => handleCitySelect(city, index)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Custom Styles */}
      <style>{`
        @keyframes ken-burns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.05) translate(-1%, -1%); }
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

        @keyframes float-ray {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0.4;
          }
        }

        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-40px) scale(1.2);
            opacity: 0.7;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes breathe {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(0.98);
          }
        }

        @keyframes breathe-glow {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes border-pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.02);
          }
        }

        @keyframes rail-flow {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 200% 0%;
          }
        }

        @keyframes rail-glow {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Phase 10: Floating glint animation */
        @keyframes float-glint {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
            transform: translate(15px, -20px) scale(1.1);
          }
        }

        /* Phase 8: Warp/hyperspace effect */
        @keyframes warp-out {
          0% {
            transform: scale(1) translateZ(0);
            opacity: 1;
          }
          100% {
            transform: scale(1.5) translateZ(100px);
            opacity: 0;
          }
        }

        .animate-warp {
          animation: warp-out 0.6s cubic-bezier(0.36, 0, 0.66, -0.56) forwards;
        }

        /* Phase 8: Teleport rays */
        @keyframes teleport-rays {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(2) rotate(360deg);
            opacity: 0;
          }
        }

        /* Phase 7c: Enhanced parallax perspective */
        @keyframes parallax-shift {
          0%, 100% {
            transform: translateZ(20px);
          }
          50% {
            transform: translateZ(50px);
          }
        }
      `}</style>
    </div>
  );
}

// Station Dot Component - Phase 10: Separate component to avoid React Hooks violations
interface StationDotProps {
  city: CityData;
  isActive: boolean;
  cityIndex: number;
  isConnected: boolean;
  previousCity: CityData | null;
}

function StationDot({ city, isActive, cityIndex, isConnected, previousCity }: StationDotProps) {
  const [isDotHovered, setIsDotHovered] = useState(false);

  return (
    <div key={city.id} className="relative group cursor-pointer"
      onMouseEnter={() => setIsDotHovered(true)}
      onMouseLeave={() => setIsDotHovered(false)}
    >
      {/* Connection glow to previous dot - Phase 7b: Regional color gradient */}
      {isConnected && cityIndex > 0 && previousCity && (
        <div
          className="absolute right-full w-[calc(100vw/13)] h-0.5 top-1/2 -translate-y-1/2"
          style={{
            background: `linear-gradient(to right, ${previousCity?.regionColor || previousCity?.color || '#4B5563'}80, ${city.regionColor || city.color}80)`,
            boxShadow: `0 0 12px ${city.regionColor || city.color}70`,
            animation: 'rail-glow 2s ease-in-out infinite',
            transition: 'box-shadow 0.3s ease',
          }}
        />
      )}

      {/* Station dot - Phase 10: Hover warm-up effect */}
      <div
        className="w-3 h-3 rounded-full transition-all duration-300 relative z-10"
        style={{
          backgroundColor: isActive
            ? city.regionColor || city.color
            : isDotHovered
            ? city.regionColor || city.color
            : '#4B5563',
          boxShadow: isActive
            ? `0 0 20px ${city.regionColor || city.color}, 0 0 10px ${city.regionColor || city.color}, 0 0 4px #fff`
            : isDotHovered
            ? `0 0 12px ${city.regionColor || city.color}80, 0 0 6px ${city.regionColor || city.color}`
            : 'none',
          border: isActive ? `2px solid ${(city.regionColor || city.color)}40` : 'none',
          animation: isActive ? 'pulse-glow 2s ease-in-out infinite' : 'none',
          transform: isDotHovered && !isActive ? 'scale(1.2)' : 'scale(1)',
        }}
      />

      {/* Outer glow ring for selected city */}
      {isActive && (
        <div
          className="absolute inset-0 w-5 h-5 -m-1 rounded-full opacity-50"
          style={{
            backgroundColor: city.regionColor || city.color,
            filter: 'blur(6px)',
            animation: 'breathe-glow 3s ease-in-out infinite',
          }}
        />
      )}

      {/* Hover glow aura for non-active dots */}
      {isDotHovered && !isActive && (
        <div
          className="absolute inset-0 w-4 h-4 -m-0.5 rounded-full opacity-40"
          style={{
            backgroundColor: city.regionColor || city.color,
            filter: 'blur(4px)',
            animation: 'breathe-glow 2s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
}

// Ticket Card Component
interface CityTicketCardProps {
  city: CityData;
  isSelected: boolean;
  distanceFromCenter: number;
  onHover: (city: CityData | null) => void;
  onSelect: () => void;
}

function CityTicketCard({ city, isSelected, distanceFromCenter, onHover, onSelect }: CityTicketCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cardParallax, setCardParallax] = useState({ x: 0, y: 0 }); // Phase 10: Card depth effect

  // Depth of field calculations - stronger hierarchy
  const scaleAmount = 1 - Math.min(distanceFromCenter * 0.08, 0.35);
  const opacityAmount = 1 - Math.min(distanceFromCenter * 0.25, 0.7);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelected) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 15;
    const y = (e.clientY - rect.top - rect.height / 2) / 15;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    onHover(null);
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <div
      className="relative flex-shrink-0 snap-center cursor-pointer"
      style={{
        transform: isSelected
          ? `translateY(-24px) scale(1.22) perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`
          : isHovered
          ? `translateY(-4px) scale(${scaleAmount * 1.03})`
          : `translateY(0) scale(${scaleAmount})`,
        filter: `brightness(${isSelected ? 1.15 : isHovered ? 0.85 : 0.5}) saturate(${isSelected ? 1.25 : 0.9}) contrast(${isSelected ? 1.05 : 1})`,
        opacity: isSelected ? 1 : opacityAmount,
        transition: isSelected
          ? 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.4s ease-out, opacity 0.4s ease-out'
          : 'transform 0.35s cubic-bezier(0.4, 0.0, 0.2, 1), filter 0.3s ease, opacity 0.3s ease',
        zIndex: isSelected ? 20 : isHovered ? 10 : 1,
      }}
      onMouseEnter={() => {
        onHover(city);
        setIsHovered(true);
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
    >
      {/* Ticket Card - Phase 7b & 11: Regional colors & enhanced glass morphism */}
      <div
        className="w-[280px] h-[160px] rounded-xl overflow-hidden transition-all duration-300 relative backdrop-blur-md"
        style={{
          border: isSelected
            ? `4px solid ${city.regionColor || city.color}`
            : isHovered
            ? `3px solid ${city.regionColor || city.color}60`
            : '3px solid rgba(255,255,255,0.15)',
          boxShadow: isSelected
            ? `0 20px 60px ${city.regionColor || city.color}80, 0 0 40px ${city.regionColor || city.color}70, inset 0 0 30px ${city.regionColor || city.color}20, inset 0 4px 10px rgba(255,255,255,0.2)`
            : isHovered
            ? `0 8px 30px ${city.regionColor || city.color}50, 0 0 20px ${city.regionColor || city.color}40, inset 0 2px 8px rgba(255,255,255,0.1)`
            : '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 4px rgba(255,255,255,0.05)',
          backgroundColor: isSelected ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.6)',
          transition: 'all 0.3s ease',
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

          {/* Right: City Info (40%) - Enhanced Typography */}
          <div className="flex-[4] flex flex-col justify-center items-start px-4 relative z-10">
            {city.isRandom ? (
              <>
                <Shuffle className="w-8 h-8 mb-2"
                  style={{
                    color: city.color,
                    filter: `drop-shadow(0 0 6px ${city.color}80)`,
                  }}
                />
                <div className="text-white font-black text-xl font-display uppercase tracking-wide"
                  style={{
                    textShadow: `0 0 12px ${city.color}70`,
                  }}
                >
                  Mystery
                </div>
                <div className="text-xs font-sans"
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  Random City
                </div>
              </>
            ) : (
              <>
                <div className="text-white font-black text-xl leading-tight mb-1 font-display uppercase"
                  style={{
                    textShadow: isSelected
                      ? `0 0 14px ${city.regionColor || city.color}90, 0 1px 4px rgba(0,0,0,0.8)`
                      : '0 1px 3px rgba(0,0,0,0.6)',
                    letterSpacing: '0.01em',
                    transition: 'text-shadow 0.3s ease',
                  }}
                >
                  {city.name}
                </div>
                <div className="text-sm font-medium mb-2 font-sans"
                  style={{
                    color: city.regionColor || city.color,
                    textShadow: isSelected
                      ? `0 0 10px ${city.regionColor || city.color}60, 0 1px 3px rgba(0,0,0,0.6)`
                      : '0 1px 2px rgba(0,0,0,0.5)',
                    letterSpacing: '0.06em',
                    opacity: 0.95,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {city.nameJapanese}
                </div>
                <div className="space-y-1 text-xs font-sans"
                  style={{
                    color: 'rgba(255,255,255,0.65)',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <Train className="w-3 h-3"
                      style={{
                        color: isSelected ? city.regionColor || city.color : 'rgba(255,255,255,0.5)',
                        filter: isSelected ? `drop-shadow(0 0 3px ${city.regionColor || city.color}60)` : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    <span className="font-medium">{city.region}</span>
                  </div>
                  <div className="font-medium flex items-center gap-1.5"
                    style={{
                      color: isSelected ? city.regionColor || city.color : 'rgba(255,255,255,0.6)',
                      textShadow: isSelected ? `0 0 6px ${city.regionColor || city.color}40` : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: isSelected ? city.regionColor || city.color : 'rgba(255,255,255,0.4)',
                        boxShadow: isSelected ? `0 0 6px ${city.regionColor || city.color}80` : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />
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

      {/* Selection Corona - Soft Neon Halo System - Phase 7b: Regional colors */}
      {isSelected && (
        <>
          {/* Outer diffused glow (far background) */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '-25%',
              right: '-25%',
              top: '-25%',
              bottom: '-25%',
              background: `radial-gradient(ellipse at center, ${city.regionColor || city.color}30, ${city.regionColor || city.color}15 50%, transparent 70%)`,
              filter: 'blur(30px)',
              opacity: 0.8,
              animation: 'breathe-glow 4s ease-in-out infinite',
              zIndex: -2,
              transition: 'background 0.6s ease',
            }}
          />

          {/* Mid-layer glow (pulsing) */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '-15%',
              right: '-15%',
              top: '-15%',
              bottom: '-15%',
              background: `radial-gradient(ellipse at center, ${city.regionColor || city.color}50, ${city.regionColor || city.color}20 60%, transparent 80%)`,
              filter: 'blur(20px)',
              opacity: 0.6,
              animation: 'pulse-glow 2.5s ease-in-out infinite',
              zIndex: -1,
              transition: 'background 0.6s ease',
            }}
          />

          {/* Sharp neon edge accent (just outside border) */}
          <div
            className="absolute pointer-events-none rounded-xl"
            style={{
              inset: '-3px',
              background: 'transparent',
              boxShadow: `0 0 15px ${city.regionColor || city.color}80, 0 0 30px ${city.regionColor || city.color}40`,
              opacity: 0.9,
              animation: 'pulse-glow 2s ease-in-out infinite 0.3s',
              zIndex: 0,
              transition: 'box-shadow 0.6s ease',
            }}
          />
        </>
      )}
    </div>
  );
}
