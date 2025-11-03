import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function HeroSection() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax effects
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Animated text reveal
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-black">
      {/* Abstract Gradient Background (Option D) */}
      <div className="absolute inset-0">
        {/* Base gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-blue-500/20" />

        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
        />

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
          {/* Cross pattern */}
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

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        {/* Main Title - LOST IN TRANSIT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <h1 className="text-7xl md:text-9xl font-black text-white tracking-tight italic transform -skew-x-6"
              style={{
                textShadow: '0 0 40px rgba(34, 217, 238, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)',
                WebkitTextStroke: '2px rgba(34, 217, 238, 0.3)',
              }}>
            LOST IN TRANSIT
          </h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl md:text-4xl font-bold text-cyan-300 tracking-wide"
          >
            Discover The Best of Japan
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl text-lg md:text-xl text-gray-300 leading-relaxed"
          >
            A curated map of fashion, food, coffee, home goods, and museums across Japan.
          </motion.p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => navigate('/map')}
          className="mt-12 px-10 py-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white text-lg font-bold rounded-xl
                     hover:scale-105 hover:shadow-2xl transition-all duration-300 transform hover:-skew-x-3
                     shadow-lg border-2 border-cyan-300/50"
          style={{
            boxShadow: '0 0 30px rgba(34, 217, 238, 0.4), 0 10px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          View All Stores
        </motion.button>

        {/* Scroll Indicator */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          onClick={scrollToContent}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 transform flex flex-col items-center gap-2 text-cyan-300/70 hover:text-cyan-300 transition-colors"
        >
          <span className="text-sm uppercase tracking-wider font-medium">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </motion.button>
      </motion.div>
    </div>
  );
}
