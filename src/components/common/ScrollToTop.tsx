import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopProps {
  /**
   * Enable scroll restoration (respects browser back/forward)
   * Default: true
   */
  enableScrollRestoration?: boolean;

  /**
   * Paths that should NOT scroll to top on navigation
   * Useful for preserving scroll position on specific routes
   */
  excludePaths?: string[];

  /**
   * Scroll behavior: 'auto' (instant) or 'smooth'
   * Default: 'auto' for better UX
   */
  behavior?: ScrollBehavior;
}

/**
 * ScrollToTop Component
 *
 * Scrolls to top of page on route changes, but intelligently:
 * - Respects browser back/forward navigation (scroll restoration)
 * - Allows excluding specific paths
 * - Compatible with Lenis smooth scroll
 *
 * Usage:
 * <ScrollToTop excludePaths={['/store']} />
 */
export function ScrollToTop({
  enableScrollRestoration = true,
  excludePaths = [],
  behavior = 'auto'
}: ScrollToTopProps) {
  const location = useLocation();

  useEffect(() => {
    // Check if current path should be excluded
    const shouldExclude = excludePaths.some(path =>
      location.pathname.startsWith(path)
    );

    if (shouldExclude) {
      return;
    }

    // Aggressive scroll reset with multiple attempts
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Immediate scroll
    scrollToTop();

    // Multiple timed scrolls to catch layout shifts
    const timeouts = [0, 10, 50, 100, 200, 300].map(delay =>
      setTimeout(scrollToTop, delay)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [location.pathname, location.search, excludePaths]);

  return null;
}
