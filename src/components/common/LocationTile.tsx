/**
 * Location Tile Component
 * 
 * Displays a square tile (120×120) for city or neighborhood
 */

import { Link } from 'react-router-dom';
import { OptimizedImage } from './OptimizedImage';
import { getCityImage, getNeighborhoodImage } from '../../utils/imageLoader';

interface LocationTileProps {
  name: string;
  type: 'city' | 'neighborhood';
  storeCount?: number;
  href: string;
  className?: string;
}

export function LocationTile({
  name,
  type,
  storeCount,
  href,
  className = '',
}: LocationTileProps) {
  // Get the square (240×240 / 2x) image
  const imageSet = type === 'city'
    ? getCityImage(name, 'square')
    : getNeighborhoodImage(name, 'square');

  if (!imageSet) {
    return null;
  }

  return (
    <Link
      to={href}
      className={`group relative block overflow-hidden rounded-lg transition-transform hover:scale-105 ${className}`}
      style={{ width: '120px', height: '120px' }}
    >
      {/* Image */}
      <OptimizedImage
        imageSet={imageSet}
        alt={`${name} - ${type}`}
        className="w-full h-full"
        loading="lazy"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-semibold text-sm leading-tight truncate">
            {name}
          </h3>
          {storeCount !== undefined && (
            <p className="text-white/80 text-xs mt-0.5">
              {storeCount} {storeCount === 1 ? 'store' : 'stores'}
            </p>
          )}
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors" />
    </Link>
  );
}

