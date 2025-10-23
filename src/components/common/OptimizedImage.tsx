/**
 * Optimized Image Component
 * 
 * Displays images with:
 * - WebP support with JPG fallback
 * - Lazy loading
 * - Responsive srcset for retina displays
 * - Loading skeleton
 */

import { useState, useEffect } from 'react';
import type { ImageSet } from '../../utils/imageLoader';

interface OptimizedImageProps {
  imageSet: ImageSet;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  imageSet,
  alt,
  className = '',
  loading = 'lazy',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Image unavailable</span>
        </div>
      )}

      {/* Actual image with WebP support */}
      <picture>
        <source
          srcSet={`${imageSet.webp} 2x`}
          type="image/webp"
        />
        <source
          srcSet={`${imageSet.jpg} 2x`}
          type="image/jpeg"
        />
        <img
          src={imageSet.jpg}
          alt={alt}
          width={imageSet.width}
          height={imageSet.height}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </picture>
    </div>
  );
}

