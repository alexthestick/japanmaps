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

      // Hide filter bar when sentinel approaches the top half of viewport
      // This means user is scrolling down towards the footer
      // Use viewport height / 2 as threshold so bar hides when user starts scrolling down
      const threshold = window.innerHeight * 0.5;
      setIsScrolledPast(rect.top < threshold);
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
