import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Shirt, Footprints, Sparkles } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'archive',
    name: 'Archive',
    icon: Archive,
    description: 'Rare designer pieces from past seasons',
    image: '/images/archive.jpg',
    storeCount: 89,
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: Shirt,
    description: 'Timeless fashion from decades past',
    image: '/images/vintage.jpg',
    storeCount: 124,
  },
  {
    id: 'streetwear',
    name: 'Streetwear',
    icon: Footprints,
    description: 'Contemporary urban fashion culture',
    image: '/images/streetwear.jpg',
    storeCount: 67,
  },
  {
    id: 'designer',
    name: 'Designer',
    icon: Sparkles,
    description: 'High-end contemporary fashion',
    image: '/images/designer.jpg',
    storeCount: 52,
  },
];

export function CategoryShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/map?category=${categoryId}`);
  };

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-b from-black via-gray-900 to-black py-20 md:py-24 overflow-hidden">
      {/* Film grain */}
      <div className="absolute inset-0 film-grain opacity-20" />

      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl italic transform -skew-x-3"
              style={{ textShadow: '0 0 30px rgba(34, 217, 238, 0.4)' }}>
            EXPLORE BY CATEGORY
          </h2>
          <p className="mt-4 text-lg text-cyan-300 font-medium">
            Find exactly what you're looking for
          </p>
        </motion.div>

        {/* Category Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.8,
                  delay: 0.1 * index,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => handleCategoryClick(category.id)}
                className="group relative cursor-pointer"
              >
                {/* Neon glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-blue-500/30 to-purple-500/30 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Card container with neon frame */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border-2 border-cyan-400/30 group-hover:border-cyan-400/60 transition-all duration-500 shadow-2xl">
                  {/* Corner decorations */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/60 z-20" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/60 z-20" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/60 z-20" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/60 z-20" />

                  {/* Image Background */}
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient Overlay with cyan tint */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
                  <div className="absolute inset-0 bg-cyan-400/5" />

                  {/* Animated neon shimmer on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                    {/* Icon with glow */}
                    <motion.div
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 backdrop-blur-sm border border-cyan-400/50"
                      style={{ boxShadow: '0 0 15px rgba(34, 217, 238, 0.3)' }}
                    >
                      <Icon className="h-6 w-6 text-cyan-300" />
                    </motion.div>

                    {/* Category Name with glow */}
                    <h3 className="font-display text-2xl font-black text-white italic"
                        style={{ textShadow: '0 0 15px rgba(34, 217, 238, 0.4)' }}>
                      {category.name}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-sm text-gray-300">{category.description}</p>

                    {/* Store Count with Kirby styling */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-cyan-300 bg-cyan-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-cyan-400/30">
                        {category.storeCount} stores
                      </span>
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-1 text-sm font-bold text-white"
                      >
                        Explore →
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
