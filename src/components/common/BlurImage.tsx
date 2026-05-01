/**
 * BlurImage — LQIP blur-up image component.
 *
 * Shows a tiny blurred placeholder (via ImageKit lqip preset) while the full
 * resolution image loads, then crossfades to the full image.
 *
 * Handles three states:
 *   loading  — skeleton or LQIP placeholder shown, full image opacity-0
 *   loaded   — full image fades in, placeholder fades out
 *   error    — image URL broken/expired; shows a styled fallback icon
 */

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { ikUrl } from '../../utils/ikUrl';

interface BlurImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
  objectPosition?: string;
}

export function BlurImage({
  src,
  alt,
  className = 'w-full h-full',
  imgClassName = 'w-full h-full object-cover',
  loading = 'lazy',
  objectPosition,
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const placeholderSrc = ikUrl(src, 'lqip');
  // hasLqip: true only for ImageKit URLs (ikUrl returns a *different* lqip URL)
  const hasLqip = placeholderSrc !== src && placeholderSrc !== '' && src !== '';

  // ── Error state — image URL is broken or expired ───────────────────────────
  if (errored) {
    return (
      <div className={`relative overflow-hidden ${className} bg-gray-800 flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-2 text-gray-600">
          <Camera className="w-8 h-8" />
          <span className="text-xs font-medium uppercase tracking-wide">No photo</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>

      {/* LQIP placeholder — tiny blurred preview for ImageKit images.
          Positioned absolutely so it sits behind the full image as it loads. */}
      {hasLqip && !loaded && (
        <img
          src={placeholderSrc}
          aria-hidden="true"
          className={`absolute inset-0 ${imgClassName} scale-110 blur-sm`}
          style={objectPosition ? { objectPosition } : undefined}
        />
      )}

      {/* Static skeleton for non-IK images (Supabase, Unsplash, etc).
          No animation — animate-pulse on many cards causes GPU repaints. */}
      {!hasLqip && !loaded && (
        <div className="absolute inset-0 bg-gray-800" />
      )}

      {/* Full resolution image — invisible until loaded, then fades in.
          onError shows the camera fallback if the URL is broken/expired. */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`${imgClassName} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  );
}
