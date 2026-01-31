import { useEffect, useState, RefObject } from 'react';

/**
 * Hook to detect when user scrolls past the map container into footer area
 * Uses Intersection Observer API for reliable detection on mobile/iOS Safari
 *
 * @param sentinelRef - Ref to sentinel element at bottom of map
 * @returns isScrolledPast - true when user has scrolled past the map
 */
export function useScrollPastMap(sentinelRef: RefObject<HTMLElement>) {
  const [isScrolledPast, setIsScrolledPast] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Use Intersection Observer - more reliable than scroll events on iOS Safari
    // This API is specifically designed for "is element in viewport?" detection
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel is NOT intersecting (not visible) = user scrolled past map
        // When sentinel IS intersecting (visible) = user scrolled back up
        const shouldHide = !entry.isIntersecting;
        setIsScrolledPast(shouldHide);

        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('[useScrollPastMap] Intersection Observer:', {
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            shouldHide,
            boundingClientRect: entry.boundingClientRect.top
          });
        }
      },
      {
        // rootMargin: top right bottom left
        // Negative top value = trigger BEFORE sentinel reaches top of viewport
        // This hides filter bar as user starts scrolling down, before reaching footer
        rootMargin: '-100px 0px 0px 0px',
        // 0 = trigger as soon as ANY part leaves viewport
        threshold: 0
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [sentinelRef]);

  return isScrolledPast;
}
