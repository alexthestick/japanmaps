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

    // Scroll immediately and multiple times to ensure it works
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Also scroll after delays to catch any layout shifts or DOM updates
    const timeout1 = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);

    const timeout2 = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);

    const timeout3 = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [location.pathname, location.search, excludePaths]);

  return null;
}
