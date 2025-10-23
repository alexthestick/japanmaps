/**
 * Motion Constants & Tokens
 * Centralized animation configuration for consistency across the app
 */

// Duration tokens (in milliseconds)
export const MOTION_DURATIONS = {
  FAST: 120,
  MICRO: 150,
  MEDIUM: 200,
  SLOW: 300,
  SCENE: 450,
} as const;

// Easing curves
export const MOTION_EASING = {
  STANDARD: 'cubic-bezier(0.4, 0, 0.2, 1)',
  EMPHASIS: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  ENTRANCE: 'cubic-bezier(0.16, 1, 0.3, 1)',
  EXIT: 'cubic-bezier(0.4, 0, 1, 1)',
  SPRING: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// Stagger configuration
export const MOTION_STAGGER = {
  MICRO: 20,    // 20ms between items
  SMALL: 30,    // 30ms between items
  MEDIUM: 40,   // 40ms between items
  LARGE: 60,    // 60ms for larger chunks
} as const;

// Z-depth scale for layering (via shadow/scale)
export const MOTION_SCALE = {
  HOVER: 1.04,
  PRESS: 0.98,
  LIFTED: 1.08,
} as const;

// Animation type definitions
export type Duration = typeof MOTION_DURATIONS[keyof typeof MOTION_DURATIONS];
export type EasingType = typeof MOTION_EASING[keyof typeof MOTION_EASING];
