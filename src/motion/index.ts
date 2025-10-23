/**
 * Motion utilities - centralized exports
 */

export { MOTION_DURATIONS, MOTION_EASING, MOTION_STAGGER, MOTION_SCALE } from './constants';
export type { Duration, EasingType } from './constants';

export {
  pageTransition,
  contentReveal,
  interaction,
  createStaggerAnimation,
} from './presets';

export { useReducedMotion, getSafeAnimationConfig } from './useReducedMotion';

export {
  initAudioContext,
  playBeep,
  playTrainArrival,
  playVendingMachineBeep,
  playFilterSelection,
  setSoundMuted,
  getSoundMuted,
  safeSoundPlay,
} from './soundEffects';
