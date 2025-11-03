import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Shuffle, ArrowLeft } from 'lucide-react';
import { LOCATIONS, MAJOR_CITIES_JAPAN } from '../lib/constants';
import { getNeighborhoodStoreCounts } from '../utils/neighborhoodData';
import { cityToSlug, neighborhoodToSlug } from '../utils/cityData';

interface NeighborhoodItem {
  id: string;
  name: string;
  city: string;
  image: string;
  previewImage: string;
  storeCount: number;
  isRandom?: boolean;
}

export function NeighborhoodsPage() {
  const navigate = useNavigate();
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<NeighborhoodItem | null>(null);
  const [storeCounts, setStoreCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  // Fetch real store counts on mount
  useEffect(() => {
    async function fetchCounts() {
      const counts = await getNeighborhoodStoreCounts();
      setStoreCounts(counts);
      setLoading(false);
    }
    fetchCounts();
  }, []);

  // Build neighborhood list with real counts
  const neighborhoods: NeighborhoodItem[] = useMemo(() => {
    const items: NeighborhoodItem[] = [];

    // Add Random as first item
    items.push({
      id: 'random',
      name: 'Random',
      city: 'Surprise Me',
      image: '/images/neighborhoods/random.jpg',
      previewImage: '/images/neighborhoods/random.jpg',
      storeCount: 0,
      isRandom: true,
    });

    // Add all neighborhoods from LOCATIONS
    Object.entries(LOCATIONS).forEach(([city, hoods]) => {
      if (hoods.length > 0) {
        hoods.forEach((hood) => {
          const key = `${city}-${hood}`;
          // Generate slug: lowercase, replace spaces with nothing, keep dashes
          // This matches how the image generation script processes names
          const slug = hood.toLowerCase().replace(/\s+/g, '').replace(/\//g, '');
          items.push({
            id: key,
            name: hood,
            city: city,
            image: `/images/neighborhoods/square/${slug}.jpg`,
            previewImage: `/images/neighborhoods/preview/${slug}-preview.jpg`,
            storeCount: storeCounts.get(key) || 0,
          });
        });
      }
    });

    // Add cities without neighborhoods (from MAJOR_CITIES_JAPAN)
    MAJOR_CITIES_JAPAN.forEach((city) => {
      const cityStr = city as string;
      // Skip if city already has neighborhoods
      if (LOCATIONS[cityStr] && LOCATIONS[cityStr].length > 0) {
        return;
      }
      // Special handling for "Kanagawa / Yokohama" -> "yokohama"
      let slug = cityStr.toLowerCase().replace(/\s+/g, '').replace(/\//g, '');
      if (cityStr === 'Kanagawa / Yokohama') {
        slug = 'yokohama';
      }
      items.push({
        id: cityStr,
        name: cityStr,
        city: 'City',
        image: `/images/cities/square/${slug}.jpg`,
        previewImage: `/images/cities/preview/${slug}-preview.jpg`,
        storeCount: storeCounts.get(cityStr) || 0,
      });
    });

    return items;
  }, [storeCounts]);

  // Calculate dynamic grid columns based on tile count
  const gridCols = useMemo(() => {
    const count = neighborhoods.length;
    if (count <= 8) return 8;
    if (count <= 16) return 8;
    if (count <= 24) return 8;
    if (count <= 32) return 8;
    return 8; // Keep max 8 columns, let it grow vertically
  }, [neighborhoods.length]);

  const handleNeighborhoodClick = (neighborhood: NeighborhoodItem) => {
    if (neighborhood.isRandom) {
      // Pick random neighborhood (exclude the Random tile itself)
      const randomIndex = Math.floor(Math.random() * (neighborhoods.length - 1)) + 1;
      const randomNeighborhood = neighborhoods[randomIndex];
      navigateToNeighborhood(randomNeighborhood);
    } else {
      navigateToNeighborhood(neighborhood);
    }
  };

  const navigateToNeighborhood = (neighborhood: NeighborhoodItem) => {
    // Extract city and neighborhood name
    const isCityOnly = neighborhood.city === 'City';
    const city = isCityOnly ? neighborhood.name : neighborhood.city;
    const hood = isCityOnly ? null : neighborhood.name;

    // Navigate to city page or neighborhood page
    const citySlug = cityToSlug(city);

    if (hood) {
      // Navigate to neighborhood page
      const neighborhoodSlug = neighborhoodToSlug(hood);
      navigate(`/city/${citySlug}/${neighborhoodSlug}`);
    } else {
      // Navigate to city page
      navigate(`/city/${citySlug}`);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-950 via-blue-900 to-purple-900" />
        <div className="text-4xl font-bold text-cyan-300 italic animate-pulse">
          Loading neighborhoods...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Animated Background Layers */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient - Melee inspired */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-blue-900 to-purple-900" />

        {/* Animated gradient mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 animate-gradient-shift" />
        </div>

        {/* Topographic/circuit lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="animate-drift" />
        </svg>

        {/* Subway/train lines drift effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-train-line-1" />
          <div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-train-line-2" />
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-train-line-3" />
          <div className="absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400/30 to-transparent animate-train-line-4" />
        </div>

        {/* Film grain texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none film-grain" />
      </div>

      {/* Melee-style Back Button - Top Left */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 z-50 group"
      >
        <div className="relative">
          {/* Glowing border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-xl opacity-50 blur group-hover:opacity-75 transition-opacity" />

          {/* Button content */}
          <div className="relative bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl rounded-xl px-6 py-4 border-2 border-cyan-400/30 flex items-center gap-3 group-hover:border-cyan-400/60 transition-all">
            <ArrowLeft className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
              BACK
            </span>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-400/60 rounded-br-xl" />
        </div>
      </button>

      <div className="h-full flex flex-col px-6 py-6 pt-8 relative">
        {/* Header - Melee style */}
        <div className="text-center mb-3">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 tracking-tight italic transform -skew-x-6">
            SELECT YOUR NEIGHBORHOOD
          </h1>
        </div>

        <div className="flex gap-6 flex-1 relative min-h-0">
          {/* LEFT PREVIEW PANE - Animated border frame */}
          <div className="w-[480px] flex-shrink-0">
            <div className="relative h-full flex items-center">
              {/* Animated border glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-50 blur-lg animate-border-pulse" />

              {/* Main preview card */}
              <div className="relative bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border-2 border-cyan-400/30 w-full h-fit">
                {/* Corner decorations - Melee style */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-cyan-400/60 rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-400/60 rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-purple-400/60 rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-pink-400/60 rounded-br-2xl" />

                {hoveredNeighborhood ? (
                  <>
                    {/* Preview Image with film grain */}
                    <div className="h-[500px] bg-gray-900 relative overflow-hidden">
                      <img
                        src={hoveredNeighborhood.previewImage}
                        alt={hoveredNeighborhood.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          // Show placeholder when image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const container = target.parentElement;
                          if (container && !container.querySelector('.preview-placeholder')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'preview-placeholder absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white/40';
                            placeholder.innerHTML = `<div class="text-center"><div class="text-4xl font-bold mb-2">${hoveredNeighborhood.name}</div><div class="text-sm">Image Coming Soon</div></div>`;
                            container.appendChild(placeholder);
                          }
                        }}
                      />
                      {/* Film grain overlay */}
                      <div className="absolute inset-0 opacity-20 mix-blend-overlay film-grain" />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                      {/* Random badge */}
                      {hoveredNeighborhood.isRandom && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600/40 to-cyan-600/40">
                          <Shuffle className="w-32 h-32 text-white/60 animate-pulse" />
                        </div>
                      )}
                    </div>

                    {/* Info Section */}
                    <div className="p-6 relative">
                      {/* Scan line effect */}
                      <div className="absolute inset-0 opacity-5 pointer-events-none"
                           style={{
                             backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
                           }}
                      />

                      <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 mb-2 italic tracking-tight">
                        {hoveredNeighborhood.name}
                      </h2>
                      <p className="text-lg text-blue-300/70 mb-4 italic font-light">
                        {hoveredNeighborhood.city}
                      </p>

                      {!hoveredNeighborhood.isRandom && (
                        <div className="flex items-center gap-2 text-cyan-200/90 bg-cyan-950/30 px-3 py-2 rounded-lg border border-cyan-500/20">
                          <MapPin className="w-5 h-5 text-cyan-400" />
                          <span className="text-base font-semibold">{hoveredNeighborhood.storeCount} stores</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Empty State */
                  <div className="h-[600px] flex items-center justify-center p-8 text-center relative">
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                         style={{
                           backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
                         }}
                    />
                    <div className="relative z-10">
                      <MapPin className="w-24 h-24 text-cyan-400/40 mx-auto mb-6 animate-pulse" />
                      <p className="text-2xl text-cyan-200/60 italic font-light">
                        Hover over a neighborhood<br />to preview
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT GRID - Dynamic columns, scaled to fit */}
          <div className="flex-1 relative flex items-center pr-32">
            {/* Grid container with border glow */}
            <div className="relative w-full">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl" />

              <div
                className={`relative grid gap-2 p-4 bg-black/20 rounded-2xl backdrop-blur-sm border-2 border-cyan-400/20 h-fit`}
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                  gridAutoRows: '90px'
                }}
              >
                {neighborhoods.map((neighborhood) => (
                  <button
                    key={neighborhood.id}
                    onMouseEnter={() => setHoveredNeighborhood(neighborhood)}
                    onMouseLeave={() => setHoveredNeighborhood(null)}
                    onClick={() => handleNeighborhoodClick(neighborhood)}
                    className={`relative overflow-hidden rounded-xl transition-all duration-200 group ${
                      hoveredNeighborhood?.id === neighborhood.id
                        ? 'ring-4 ring-cyan-400 shadow-2xl shadow-cyan-500/50 scale-110 z-10 -translate-y-2'
                        : 'hover:scale-105 hover:shadow-xl hover:-translate-y-1'
                    }`}
                    style={{
                      animation: hoveredNeighborhood?.id === neighborhood.id
                        ? 'bounce-subtle 0.4s ease-out'
                        : 'none'
                    }}
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                      <img
                        src={neighborhood.image}
                        alt={neighborhood.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          // Hide broken image and show placeholder
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Show placeholder text on parent
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.image-placeholder')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'image-placeholder absolute inset-0 flex items-center justify-center text-white/30 text-xs';
                            placeholder.textContent = neighborhood.name;
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    </div>

                    {/* Overlay for Random tile */}
                    {neighborhood.isRandom && (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-cyan-600/90 flex items-center justify-center">
                        <Shuffle className="w-12 h-12 text-white drop-shadow-lg" />
                      </div>
                    )}

                    {/* Hover glow effect */}
                    {hoveredNeighborhood?.id === neighborhood.id && (
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-blue-400/30 to-purple-400/30 animate-pulse" />
                    )}

                    {/* Border highlight on hover */}
                    <div className={`absolute inset-0 border-2 rounded-xl transition-all duration-200 ${
                      hoveredNeighborhood?.id === neighborhood.id
                        ? 'border-cyan-300 shadow-inner shadow-cyan-300/50'
                        : 'border-transparent'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Japanese Neighborhood Select text - Melee style, bottom right corner */}
        <div className="absolute bottom-6 right-8 pointer-events-none z-0">
          <div className="relative">
            <div className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-50 tracking-wider transform skew-x-3">
              ネイバーフッド選択
            </div>
            <div className="absolute inset-0 text-4xl font-black italic text-cyan-300 opacity-10 tracking-wider transform skew-x-3 blur-md">
              ネイバーフッド選択
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
