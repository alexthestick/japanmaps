/**
 * useReducedMotion Hook
 * Respects user's prefers-reduced-motion preference for accessibility
 */

import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Get safe animation config that respects reduced motion preference
 * Returns instant animation if reduced motion is preferred, otherwise returns full config
 */
export function getSafeAnimationConfig<T extends Record<string, any>>(
  fullConfig: T,
  prefersReducedMotion: boolean
): T {
  if (!prefersReducedMotion) {
    return fullConfig;
  }

  // Return config with instant transition for reduced motion
  return {
    ...fullConfig,
    transition: { duration: 0 },
  };
}
