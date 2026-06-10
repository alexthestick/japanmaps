import { useState, useEffect } from 'react';

/**
 * Custom hook to detect media query matches
 * @param query - CSS media query string (e.g., '(max-width: 767px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create listener for changes
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
    // Legacy browsers (Safari < 14)
    else {
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [query]);

  return matches;
}

/**
 * Convenience hook for mobile devices.
 * Returns true for portrait phones (< 768px wide) AND landscape phones
 * (touch device with viewport height ≤ 500px).
 *
 * Without the second clause, iPhones in landscape (932px wide, 430px tall)
 * pass the 768px breakpoint and render as desktop — showing the map legend,
 * search bar, and category panel on a phone held sideways.
 *
 * `pointer: coarse` distinguishes touch devices from a laptop with a small
 * browser window, which should still get the desktop layout.
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px), (max-height: 500px) and (pointer: coarse)');
}

/**
 * Convenience hook for tablet devices (768px - 1023px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * Convenience hook for desktop devices (>= 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
