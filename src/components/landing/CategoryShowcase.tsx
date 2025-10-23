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
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
    storeCount: 89,
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: Shirt,
    description: 'Timeless fashion from decades past',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',
    storeCount: 124,
  },
  {
    id: 'streetwear',
    name: 'Streetwear',
    icon: Footprints,
    description: 'Contemporary urban fashion culture',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80',
    storeCount: 67,
  },
  {
    id: 'designer',
    name: 'Designer',
    icon: Sparkles,
    description: 'High-end contemporary fashion',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
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
    <section ref={sectionRef} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-4xl font-bold text-accent md:text-5xl lg:text-6xl">
            Explore by Category
          </h2>
          <p className="mt-4 text-lg text-primary-600">
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
                className="group relative cursor-pointer overflow-hidden rounded-xl"
              >
                {/* Image Background */}
                <div className="aspect-[3/4] w-full overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </motion.div>

                  {/* Category Name */}
                  <h3 className="font-display text-2xl font-bold text-white">
                    {category.name}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-sm text-white/80">{category.description}</p>

                  {/* Store Count */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-white/90">
                      {category.storeCount} stores
                    </span>
                    <motion.div
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-1 text-sm font-medium text-white"
                    >
                      Explore →
                    </motion.div>
                  </div>

                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 border-2 border-white opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
