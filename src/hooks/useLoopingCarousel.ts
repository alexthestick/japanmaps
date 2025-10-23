import { useState, useCallback, useMemo } from 'react';

interface UseLoopingCarouselOptions {
  cloneCount?: number;
  cardWidth?: number;
  transitionMs?: number;
}

export const useLoopingCarousel = (
  items: any[],
  options: UseLoopingCarouselOptions = {}
) => {
  const CLONE_COUNT = options.cloneCount || 9;
  const CARD_WIDTH = options.cardWidth || 304;
  const TRANSITION_MS = options.transitionMs || 300;

  // Create extended array with clones
  const extendedItems = useMemo(() => {
    if (items.length === 0) return [];
    const leftClones = items.slice(-CLONE_COUNT);
    const rightClones = items.slice(0, CLONE_COUNT);
    return [...leftClones, ...items, ...rightClones];
  }, [items, CLONE_COUNT]);

  // State management
  const [displayIndex, setDisplayIndex] = useState(CLONE_COUNT);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shouldTransition, setShouldTransition] = useState(true);

  // Calculate logical index (position in real items array)
  const logicalIndex = useMemo(() => {
    if (items.length === 0) return 0;
    const rawIndex = displayIndex - CLONE_COUNT;
    return ((rawIndex % items.length) + items.length) % items.length;
  }, [displayIndex, items.length, CLONE_COUNT]);

  // Calculate transform translateX (GPU accelerated)
  const translateX = useMemo(() => {
    return displayIndex * CARD_WIDTH * -1;
  }, [displayIndex, CARD_WIDTH]);

  // Get current real city
  const currentCity = useMemo(() => {
    if (items.length === 0) return null;
    return items[logicalIndex];
  }, [logicalIndex, items]);

  // Navigation function with smart wrapping
  const navigate = useCallback(
    (direction: 'next' | 'prev') => {
      // Prevent navigation during transition
      if (isTransitioning || items.length === 0) return;

      setIsTransitioning(true);
      setShouldTransition(true);

      let newIndex = direction === 'next' ? displayIndex + 1 : displayIndex - 1;

      setDisplayIndex(newIndex);

      // After animation completes, check if we need to teleport
      const timeoutId = setTimeout(() => {
        // Check right boundary: if past last real city
        if (newIndex >= CLONE_COUNT + items.length) {
          // Wrap to beginning of real cities (instant, no animation)
          setShouldTransition(false);
          setDisplayIndex(CLONE_COUNT);
        }
        // Check left boundary: if before first real city
        else if (newIndex < CLONE_COUNT) {
          // Wrap to end of real cities (instant, no animation)
          setShouldTransition(false);
          setDisplayIndex(CLONE_COUNT + items.length - 1);
        }

        setIsTransitioning(false);
      }, TRANSITION_MS);

      return () => clearTimeout(timeoutId);
    },
    [displayIndex, isTransitioning, items.length, CLONE_COUNT, TRANSITION_MS]
  );

  return {
    displayIndex,
    logicalIndex,
    translateX,
    extendedItems,
    currentCity,
    next: () => navigate('next'),
    prev: () => navigate('prev'),
    isTransitioning,
    shouldTransition,
    CLONE_COUNT,
    CARD_WIDTH,
  };
};
