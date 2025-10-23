import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, ArrowRight } from 'lucide-react';

export function MapPreviewCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-accent py-32 md:py-40">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
        >
          <Map className="h-10 w-10 text-white" />
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
        >
          Start Your Fashion Journey
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-2xl text-lg text-white/80 md:text-xl"
        >
          Discover curated vintage, archive, and streetwear stores across Japan. Plan your route, save your favorites, and never miss a hidden gem.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {/* Primary CTA */}
          <button
            onClick={() => navigate('/map')}
            className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-medium text-accent transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <span>Explore the Map</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.span>
          </button>

          {/* Secondary CTA */}
          <button
            onClick={() => navigate('/suggest')}
            className="group rounded-full border-2 border-white/30 px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/10"
          >
            Suggest a Store
          </button>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 flex items-center justify-center gap-2 text-sm text-white/60"
        >
          <span>Curated by fashion enthusiasts</span>
          <span>•</span>
          <span>Updated daily</span>
          <span>•</span>
          <span>Free to use</span>
        </motion.div>
      </div>
    </section>
  );
}
