/**
 * Framer Motion Animation Presets
 * Reusable animation configurations for consistent motion patterns
 */

import { MOTION_DURATIONS, MOTION_EASING, MOTION_STAGGER } from './constants';

/**
 * Page transition presets
 */
export const pageTransition = {
  // Horizontal slide for city pages (Shinkansen feel)
  citySlideIn: {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
    transition: {
      duration: MOTION_DURATIONS.SCENE / 1000,
      ease: MOTION_EASING.ENTRANCE,
    },
  },

  // Standard fade
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: MOTION_DURATIONS.SLOW / 1000 },
  },
};

/**
 * Content reveal presets
 */
export const contentReveal = {
  // Fade + slide up
  fadeSlideUp: (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: MOTION_DURATIONS.MEDIUM / 1000,
      ease: MOTION_EASING.ENTRANCE,
      delay: delay / 1000,
    },
  }),

  // Staggered list reveal
  staggerContainer: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      staggerChildren: MOTION_STAGGER.SMALL / 1000,
      delayChildren: 0.1,
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: MOTION_DURATIONS.MEDIUM / 1000,
      ease: MOTION_EASING.ENTRANCE,
    },
  },
};

/**
 * Interaction presets (hover, click)
 */
export const interaction = {
  // Hover lift with shadow
  hoverLift: {
    whileHover: { scale: 1.04, transition: { duration: MOTION_DURATIONS.FAST / 1000 } },
    whileTap: { scale: 0.98, transition: { duration: MOTION_DURATIONS.FAST / 1000 } },
  },

  // Button press
  buttonPress: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.96 },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  },

  // Subtle scale on hover
  scaleOnHover: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  },
};

/**
 * Utility to create staggered container animation
 */
export const createStaggerAnimation = (itemCount: number, baseDelay = 0) => ({
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: MOTION_STAGGER.SMALL / 1000,
        delayChildren: baseDelay / 1000,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION_DURATIONS.MEDIUM / 1000,
        ease: MOTION_EASING.ENTRANCE,
      },
    },
  },
});
