/**
 * BlurImage — LQIP blur-up image component.
 *
 * Shows a tiny blurred placeholder (via ImageKit lqip preset) while the full
 * resolution image loads, then crossfades to the full image. Falls back to a
 * solid skeleton for non-ImageKit URLs.
 */

import { useState } from 'react';
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
  const placeholderSrc = ikUrl(src, 'lqip');
  const hasLqip = placeholderSrc !== src && placeholderSrc !== '';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* LQIP placeholder — blurred tiny image, always visible until full loads */}
      {hasLqip && (
        <img
          src={placeholderSrc}
          aria-hidden="true"
          className={`absolute inset-0 ${imgClassName} scale-110 blur-sm transition-opacity duration-300 ${loaded ? 'opacity-0' : 'opacity-100'}`}
          style={objectPosition ? { objectPosition } : undefined}
        />
      )}
      {/* Skeleton fallback for non-IK images — static, no animation.
          animate-pulse on a full-card div would cause GPU repaint × card count. */}
      {!hasLqip && !loaded && (
        <div className="absolute inset-0 bg-gray-800" />
      )}
      {/* Full resolution image */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        className={`${imgClassName} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  );
}
