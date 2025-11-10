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

    // Check if this is a back/forward navigation (POP action)
    // We want to preserve scroll position for these
    if (enableScrollRestoration && window.history.state?.scrollY !== undefined) {
      // Browser will handle scroll restoration automatically
      return;
    }

    // For new navigation (PUSH/REPLACE), scroll to top
    // Use setTimeout to ensure DOM is ready
    const scrollTimeout = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: behavior
      });
    }, 0);

    return () => clearTimeout(scrollTimeout);
  }, [location.pathname, location.search, enableScrollRestoration, excludePaths, behavior]);

  return null;
}
