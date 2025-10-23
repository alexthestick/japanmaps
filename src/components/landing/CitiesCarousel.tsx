import { motion, useInView } from 'framer-motion';
import { useRef, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { getCityDataWithCounts, type CityData } from '../../utils/cityData';

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
    navigate(`/map?city=${cityName}`);
  };

  return (
    <section ref={sectionRef} className="bg-gradient-to-b from-white via-gray-50 to-white py-32 md:py-40">
      <div className="mx-auto max-w-[1800px] px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-5xl font-bold text-gray-900 md:text-6xl lg:text-7xl tracking-tight">
            Shop by City
          </h2>
          <p className="mt-6 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Explore fashion destinations across Japan — from Tokyo's bustling streets to Kyoto's traditional charm
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
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-4 hidden lg:flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6 text-accent" />
          </button>

          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4 hidden lg:flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6 text-accent" />
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
                  {/* Image Container - MUCH BIGGER */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-2xl">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="h-full w-full object-cover transition-all duration-1000 group-hover:scale-125 group-hover:brightness-110"
                    />
                    {/* Gradient Overlay - More dramatic */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    
                    {/* Animated shimmer effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    </div>

                    {/* Content - Bigger & Bolder */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
                      <div className="flex items-center gap-2 text-white/90 text-base mb-3">
                        <MapPin className="h-5 w-5" />
                        <span className="font-medium">{CITY_REGIONS[city.name] || 'Japan'}</span>
                      </div>

                      <h3 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight transform group-hover:translate-y-[-8px] transition-transform duration-500">
                        {city.name}
                      </h3>

                      <div className="flex items-center justify-between">
                        <span className="text-white text-lg md:text-xl font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          {city.storeCount} {city.storeCount === 1 ? 'store' : 'stores'}
                        </span>
                        <motion.div
                          initial={{ x: 0 }}
                          whileHover={{ x: 8 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-2 text-lg font-bold text-white bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full group-hover:bg-white/30"
                        >
                          <span>Explore</span>
                          <ArrowRight className="h-5 w-5" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Hover Border Effect - More prominent */}
                    <div className="absolute inset-0 border-4 border-white opacity-0 transition-all duration-500 group-hover:opacity-40 rounded-3xl group-hover:inset-[-4px]" />
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
