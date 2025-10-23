/**
 * Sound Effects Manager
 * Handles audio playback for motion events (train arrival, vending machine buttons, etc.)
 */

// Web Audio API context
let audioContext: AudioContext | null = null;

/**
 * Initialize audio context (required by browser autoplay policy)
 */
export function initAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play a beep sound using Web Audio API
 * @param frequency Frequency in Hz (e.g., 800 for high beep, 400 for low beep)
 * @param duration Duration in milliseconds
 * @param volume Volume 0-1
 */
export function playBeep(frequency: number = 800, duration: number = 150, volume: number = 0.3): void {
  try {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch (error) {
    console.warn('Sound playback failed:', error);
    // Silently fail - don't break user experience if audio fails
  }
}

/**
 * Play train arrival sound (two ascending beeps)
 * Common Japanese train station notification sound
 */
export function playTrainArrival(): void {
  // First beep: 400 Hz for 100ms
  playBeep(400, 100, 0.25);
  // Second beep: 600 Hz for 150ms, delayed by 120ms
  setTimeout(() => playBeep(600, 150, 0.25), 120);
}

/**
 * Play vending machine button press sound (single bright beep)
 */
export function playVendingMachineBeep(): void {
  playBeep(900, 80, 0.2);
}

/**
 * Play filter selection sound
 */
export function playFilterSelection(): void {
  playBeep(750, 100, 0.2);
}

/**
 * Mute all sounds (for user preference or accessibility)
 */
let isMuted = false;

export function setSoundMuted(muted: boolean): void {
  isMuted = muted;
}

export function getSoundMuted(): boolean {
  return isMuted;
}

/**
 * Safe wrapper - only plays if not muted
 */
export function safeSoundPlay(soundFn: () => void): void {
  if (!isMuted) {
    soundFn();
  }
}
