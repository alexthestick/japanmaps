import { useEffect, useState } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { useNavigate } from 'react-router-dom';
import { Map } from 'lucide-react';
import { HeroSection } from '../components/landing/HeroSection';
import { StatsBar } from '../components/landing/StatsBar';
import { CitiesCarousel } from '../components/landing/CitiesCarousel';
import { CategoryShowcase } from '../components/landing/CategoryShowcase';
import { CompactFooter } from '../components/landing/CompactFooter';
import { MetroTimeline } from '../components/landing/MetroTimeline';
import { MarqueeTicker } from '../components/landing/MarqueeTicker';
import { CommunityFinds } from '../components/landing/FieldNotes';
import { NeighborhoodsShowcase } from '../components/landing/NeighborhoodsShowcase';
import { SEOHead, generateWebsiteSchema, generateOrganizationSchema } from '../components/seo';

export function NewLandingPage() {
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Show floating CTA after hero scrolls out of view
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      // hero is roughly the first 15% of scroll progress
      setShowFloatingCTA(v > 0.08);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  // Generate structured data for homepage
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden">

      {/* ── Page-wide background: gradient orbs + map lines + film grain ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-blue-500/10" />
        {/* Slow drifting orbs */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.22, 0.15], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.2, 0.12], x: [0, -25, 0], y: [0, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
          className="absolute top-2/3 left-1/2 w-[400px] h-[400px] bg-blue-400/15 rounded-full blur-3xl"
        />
        {/* Map lines */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="map-lines-bg" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <line x1="0" y1="50" x2="200" y2="50" stroke="#22D9EE" strokeWidth="0.5" opacity="0.5" />
                <line x1="0" y1="100" x2="200" y2="100" stroke="#3B82F6" strokeWidth="0.5" opacity="0.5" />
                <line x1="0" y1="150" x2="200" y2="150" stroke="#A855F7" strokeWidth="0.5" opacity="0.5" />
                <line x1="50" y1="0" x2="50" y2="200" stroke="#22D9EE" strokeWidth="0.5" opacity="0.5" />
                <line x1="100" y1="0" x2="100" y2="200" stroke="#3B82F6" strokeWidth="0.5" opacity="0.5" />
                <line x1="150" y1="0" x2="150" y2="200" stroke="#A855F7" strokeWidth="0.5" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-lines-bg)" />
          </svg>
        </div>
        {/* Film grain */}
        <div className="absolute inset-0 film-grain opacity-20" />
      </div>

      {/* ── Page content (above fixed background) ── */}
      <div className="relative z-10">
        {/* SEO Head */}
        <SEOHead
          url="/"
          jsonLd={[websiteSchema, organizationSchema]}
        />

        <HeroSection />
        <StatsBar />
        <MarqueeTicker />
        <MetroTimeline />
        <CitiesCarousel />
        <NeighborhoodsShowcase />
        <CategoryShowcase />
        <CommunityFinds />
        <CompactFooter />
      </div>

      {/* ── Floating Explore Map CTA ── */}
      <AnimatePresence>
        {showFloatingCTA && (
          <motion.button
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => navigate('/map')}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-full border border-cyan-300/30 hover:scale-105 transition-transform duration-200"
            style={{ boxShadow: '0 0 24px rgba(34, 217, 238, 0.4), 0 8px 32px rgba(0,0,0,0.5)' }}
          >
            <Map className="w-3.5 h-3.5" />
            Explore the Map
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
