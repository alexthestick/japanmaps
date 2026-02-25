import { useEffect } from 'react';
import { useScroll } from 'framer-motion';
import Lenis from 'lenis';
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

  // Generate structured data for homepage
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <div className="min-h-screen bg-black">
      {/* SEO Head - Homepage uses defaults from index.html but adds structured data */}
      <SEOHead
        url="/"
        jsonLd={[websiteSchema, organizationSchema]}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Bar */}
      <StatsBar />

      {/* Marquee ticker — divider between stats and articles */}
      <MarqueeTicker />

      {/* Metro Timeline — Latest articles */}
      <MetroTimeline />

      {/* Cities Carousel */}
      <CitiesCarousel />

      {/* Neighborhoods Showcase */}
      <NeighborhoodsShowcase />

      {/* Category Showcase */}
      <CategoryShowcase />

      {/* Field Notes — community visits & hauls */}
      <CommunityFinds />

      {/* Compact Footer */}
      <CompactFooter />
    </div>
  );
}
