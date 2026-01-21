import { useEffect } from 'react';
import { useScroll } from 'framer-motion';
import Lenis from 'lenis';
import { HeroSection } from '../components/landing/HeroSection';
import { StatsBar } from '../components/landing/StatsBar';
import { CitiesCarousel } from '../components/landing/CitiesCarousel';
import { TrainTicketMenu } from '../components/landing/TrainTicketMenu';
import { CategoryShowcase } from '../components/landing/CategoryShowcase';
import { CompactFooter } from '../components/landing/CompactFooter';
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
    <div className="min-h-screen bg-white">
      {/* SEO Head - Homepage uses defaults from index.html but adds structured data */}
      <SEOHead
        url="/"
        jsonLd={[websiteSchema, organizationSchema]}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Bar */}
      <StatsBar />

      {/* Cities Carousel */}
      <CitiesCarousel />

      {/* Category Showcase */}
      <CategoryShowcase />

      {/* Train Ticket Menu Cards */}
      <TrainTicketMenu />

      {/* Compact Footer */}
      <CompactFooter />
    </div>
  );
}
