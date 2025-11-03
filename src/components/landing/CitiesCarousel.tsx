import { motion, useInView } from 'framer-motion';
import { useRef, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { getCityDataWithCounts, cityToSlug, type CityData } from '../../utils/cityData';

// City regions for display
const CITY_REGIONS: Record<string, string> = {
  Tokyo: 'Kantō',
  Osaka: 'Kansai',
  Kyoto: 'Kansai',
  Fukuoka: 'Kyushu',
  Nagoya: 'Chūbu',
  Yokohama: 'Kantō',
  Sapporo: 'Hokkaidō',
  Hiroshima: 'Chūgoku',
  Kanazawa: 'Hokuriku',
  Kobe: 'Kansai',
  Niigata: 'Chūbu',
  Chiba: 'Kantō',
  Takamatsu: 'Shikoku',
  Fukushima: 'Tōhoku',
  Kanagawa: 'Kantō',
};

export function CitiesCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const navigate = useNavigate();
  const [cities, setCities] = useState<CityData[]>([]);

  useEffect(() => {
    getCityDataWithCounts().then(setCities);
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handleCityClick = (cityName: string) => {
    const slug = cityToSlug(cityName);
    navigate(`/city/${slug}`);
  };

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-b from-black via-gray-900 to-black py-20 md:py-24 overflow-hidden">
      {/* Film grain texture */}
      <div className="absolute inset-0 film-grain opacity-20" />

      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative mx-auto max-w-[1800px] px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <h2 className="font-display text-5xl font-bold text-white md:text-6xl lg:text-7xl tracking-tight italic transform -skew-x-3"
              style={{ textShadow: '0 0 30px rgba(34, 217, 238, 0.4)' }}>
            EXPLORE BY CITY
          </h2>
          <p className="mt-4 text-xl md:text-2xl text-cyan-300 max-w-3xl mx-auto font-medium">
            From Tokyo's neon streets to Kyoto's hidden gems
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-4 hidden lg:flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg transition-all hover:scale-110 hover:shadow-2xl border-2 border-cyan-300/50"
            style={{ boxShadow: '0 0 20px rgba(34, 217, 238, 0.4)' }}
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4 hidden lg:flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg transition-all hover:scale-110 hover:shadow-2xl border-2 border-cyan-300/50"
            style={{ boxShadow: '0 0 20px rgba(34, 217, 238, 0.4)' }}
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-8">
              {cities.map((city, index) => (
                <motion.div
                  key={city.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 0.1 * index,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() => handleCityClick(city.name)}
                  className="group relative min-w-0 flex-[0_0_90%] cursor-pointer md:flex-[0_0_60%] lg:flex-[0_0_45%] xl:flex-[0_0_38%]"
                >
                  {/* Glowing border container */}
                  <div className="relative">
                    {/* Outer glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-blue-500/30 to-purple-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Image Container */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl shadow-2xl border-2 border-cyan-400/20 group-hover:border-cyan-400/60 transition-all duration-500">
                      {/* Corner decorations */}
                      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 z-20" />
                      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 z-20" />
                      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60 z-20" />
                      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60 z-20" />

                      <img
                        src={city.image}
                        alt={city.name}
                        className="h-full w-full object-cover transition-all duration-1000 group-hover:scale-125 group-hover:brightness-110"
                      />
                      {/* Gradient Overlay with cyan tint */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                      <div className="absolute inset-0 bg-cyan-400/5" />

                      {/* Animated shimmer effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      </div>

                      {/* Content - Bigger & Bolder with Kirby theme */}
                      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10 z-10">
                        <div className="flex items-center gap-2 text-cyan-300 text-base mb-3">
                          <MapPin className="h-5 w-5" />
                          <span className="font-bold">{CITY_REGIONS[city.name] || 'Japan'}</span>
                        </div>

                        <h3 className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight transform group-hover:translate-y-[-8px] transition-transform duration-500 italic"
                            style={{ textShadow: '0 0 20px rgba(34, 217, 238, 0.5)' }}>
                          {city.name}
                        </h3>

                        <div className="flex items-center justify-between">
                          <span className="text-white text-lg md:text-xl font-bold bg-gradient-to-r from-cyan-500/30 to-blue-500/30 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-400/30">
                            {city.storeCount} {city.storeCount === 1 ? 'store' : 'stores'}
                          </span>
                          <motion.div
                            initial={{ x: 0 }}
                            whileHover={{ x: 8 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-2 text-lg font-bold text-white bg-gradient-to-r from-cyan-400/30 to-blue-500/30 backdrop-blur-sm px-6 py-3 rounded-full border border-cyan-400/50 group-hover:border-cyan-400/80"
                            style={{ boxShadow: '0 0 15px rgba(34, 217, 238, 0.3)' }}
                          >
                            <span>Explore</span>
                            <ArrowRight className="h-5 w-5" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
