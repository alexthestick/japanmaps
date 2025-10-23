/**
 * Location Preview Component
 * 
 * Displays a large preview image (420×500) for detail pages
 */

import { OptimizedImage } from './OptimizedImage';
import { getCityImage, getNeighborhoodImage } from '../../utils/imageLoader';

interface LocationPreviewProps {
  name: string;
  type: 'city' | 'neighborhood';
  alt?: string;
  className?: string;
}

export function LocationPreview({
  name,
  type,
  alt,
  className = '',
}: LocationPreviewProps) {
  // Get the preview (840×1000 / 2x) image
  const imageSet = type === 'city'
    ? getCityImage(name, 'preview')
    : getNeighborhoodImage(name, 'preview');

  if (!imageSet) {
    return null;
  }

  const altText = alt || `${name} - ${type === 'city' ? 'City' : 'Neighborhood'} overview`;

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <OptimizedImage
        imageSet={imageSet}
        alt={altText}
        className="w-full h-full"
        loading="eager"
      />
      
      {/* Optional: Add overlay with location name */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
        <h1 className="text-white text-3xl font-bold drop-shadow-lg">
          {name}
        </h1>
      </div>
    </div>
  );
}

