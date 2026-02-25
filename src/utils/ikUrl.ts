/**
 * ImageKit URL transformation helper.
 *
 * Appends ImageKit `tr` params only for ik.imagekit.io URLs.
 * Passes all other URLs through unchanged (Unsplash, Supabase, etc.)
 *
 * Preset sizes:
 *   thumb  – 400px wide, q-65, WebP  → store cards, similar-store thumbnails, find cards
 *   card   – 800px wide, q-75, WebP  → list-view cards, gallery grid small tiles
 *   hero   – 1400px wide, q-80, WebP → store detail hero, lightbox
 *   og     – 1200×630, q-85          → OG / social share images
 */

const IK_BASE = 'https://ik.imagekit.io/';

type Preset = 'thumb' | 'card' | 'hero' | 'og';

const PRESETS: Record<Preset, string> = {
  thumb: 'w-400,q-65,f-auto',
  card:  'w-800,q-75,f-auto',
  hero:  'w-1400,q-80,f-auto',
  og:    'w-1200,h-630,c-maintain_ratio,q-85,f-auto',
};

/**
 * Returns a URL with ImageKit transformation params applied.
 *
 * @param url     - Original image URL (ImageKit or external)
 * @param preset  - Size preset: 'thumb' | 'card' | 'hero' | 'og'
 * @returns       Optimized URL (or original URL unchanged for non-IK sources)
 *
 * @example
 *   ikUrl(store.photos[0], 'thumb')
 *   // → "https://ik.imagekit.io/.../photo.jpg?tr=w-400,q-65,f-auto"
 */
export function ikUrl(url: string | null | undefined, preset: Preset): string {
  if (!url) return '';

  // Only apply to ImageKit-hosted images
  if (!url.includes(IK_BASE)) return url;

  // Strip any existing tr= param to avoid conflicts
  const base = url.split('?tr=')[0].split('&tr=')[0];

  return `${base}?tr=${PRESETS[preset]}`;
}
