import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { supabase } from '../../lib/supabase';
import type { Store } from '../../types/store';

export function FeaturedStoresCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
    dragFree: true,
  });

  // Fetch featured stores
  useEffect(() => {
    async function fetchFeaturedStores() {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('verified', true)
        .limit(6)
        .order('save_count', { ascending: false });

      if (data && !error) {
        setStores(data.map(store => ({
          ...store,
          mainCategory: store.main_category,
          priceRange: store.price_range,
          createdAt: store.created_at,
          updatedAt: store.updated_at,
          submittedBy: store.submitted_by,
          haulCount: store.haul_count || 0,
          saveCount: store.save_count || 0,
        })));
      }
      setLoading(false);
    }
    fetchFeaturedStores();
  }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handleStoreClick = (storeId: string, e: React.MouseEvent) => {
    // Prevent navigation if dragging
    if (emblaApi && emblaApi.clickAllowed()) {
      navigate(`/store/${storeId}`);
    }
  };

  if (loading) {
    return (
      <section className="bg-primary-50 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <div className="h-8 w-48 mx-auto bg-primary-200 rounded animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  if (stores.length === 0) return null;

  return (
    <section ref={sectionRef} className="bg-primary-50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <h2 className="font-display text-4xl font-bold text-accent md:text-5xl lg:text-6xl">
            Featured Stores
          </h2>
          <p className="mt-4 text-lg text-primary-600">
            Handpicked destinations for your Japan fashion journey
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
            <div className="flex gap-6">
              {stores.map((store, index) => {
                const mainImage = store.photos?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80';
                const location = store.neighborhood ? `${store.neighborhood}, ${store.city}` : store.city;

                return (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{
                      duration: 0.6,
                      delay: 0.1 * index,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="group relative min-w-0 flex-[0_0_85%] cursor-pointer md:flex-[0_0_45%] lg:flex-[0_0_30%]"
                    onClick={(e) => handleStoreClick(store.id, e)}
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg">
                      <img
                        src={mainImage}
                        alt={store.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      {/* Category Badge */}
                      {store.categories?.[0] && (
                        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-accent backdrop-blur-sm capitalize">
                          {store.categories[0]}
                        </div>
                      )}

                      {/* Hover Content */}
                      <div className="absolute bottom-0 left-0 right-0 translate-y-4 p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        {store.description && (
                          <p className="text-sm text-white/90 line-clamp-3">{store.description}</p>
                        )}
                        <div className="mt-3 flex items-center gap-2 text-white">
                          <span className="text-sm font-medium">View Details</span>
                          <ExternalLink className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    {/* Store Info */}
                    <div className="mt-4">
                      <h3 className="font-display text-xl font-semibold text-accent">
                        {store.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-sm text-primary-600">
                        <MapPin className="h-4 w-4" />
                        <span>{location}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <button
              onClick={() => navigate('/map')}
              className="group inline-flex items-center gap-2 rounded-full border-2 border-accent px-8 py-4 font-medium text-accent transition-all hover:bg-accent hover:text-white"
            >
              View All Stores
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                →
              </motion.span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
