import { useEffect, useState, RefObject } from 'react';

/**
 * Hook to detect when user scrolls past the map container into footer area
 * Uses scroll position to detect when user has scrolled beyond map height
 *
 * @param sentinelRef - Ref to sentinel element at bottom of map
 * @returns isScrolledPast - true when user has scrolled past the map
 */
export function useScrollPastMap(sentinelRef: RefObject<HTMLElement>) {
  const [isScrolledPast, setIsScrolledPast] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const handleScroll = () => {
      // Get the sentinel's position relative to the viewport
      const rect = sentinel.getBoundingClientRect();

      // Hide filter bar when user has scrolled down significantly
      // When user scrolls to footer, sentinel will have negative or very small rect.top
      // We use a generous threshold to ensure it triggers reliably
      const viewportHeight = window.innerHeight;
      const threshold = viewportHeight * 0.8; // Hide when sentinel is in top 20% of viewport or above

      const shouldHide = rect.top < threshold;
      setIsScrolledPast(shouldHide);

      // Debug logging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('[useScrollPastMap]', {
          rectTop: rect.top,
          threshold,
          shouldHide,
          viewportHeight
        });
      }
    };

    // Initial check
    handleScroll();

    // Listen to scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Also listen to touchmove for better iOS Safari support
    window.addEventListener('touchmove', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
    };
  }, [sentinelRef]);

  return isScrolledPast;
}
