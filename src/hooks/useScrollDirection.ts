import { useEffect, useState } from 'react';

/**
 * Simple hook to detect scroll direction on mobile
 * Hides filter bar when scrolling down, shows when scrolling up
 *
 * Much more reliable than Intersection Observer on iOS Safari
 * Common pattern used by Twitter, Instagram, etc.
 *
 * @returns isScrollingDown - true when user scrolls down (hide filter bar)
 */
export function useScrollDirection() {
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Only hide if scrolled down more than 10px from top
          // This prevents hiding on tiny accidental scrolls
          if (currentScrollY > 10) {
            // Scrolling down → hide filter bar
            if (currentScrollY > lastScrollY) {
              setIsScrollingDown(true);
            }
            // Scrolling up → show filter bar
            else if (currentScrollY < lastScrollY) {
              setIsScrollingDown(false);
            }
          } else {
            // At the very top → always show filter bar
            setIsScrollingDown(false);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    // Listen to scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return isScrollingDown;
}
