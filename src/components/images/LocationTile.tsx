import { OptimizedImage } from './OptimizedImage';
import { useState } from 'react';

interface LocationTileProps {
  name: string;
  type: 'neighborhood' | 'city';
  alt: string;
  onClick?: () => void;
  className?: string;
}

export function LocationTile({
  name,
  type,
  alt,
  onClick,
  className = '',
}: LocationTileProps) {
  const [imageError, setImageError] = useState(false);
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const basePath = `/images/${type === 'neighborhood' ? 'neighborhoods' : 'cities'}/square`;

  if (imageError) {
    // Fallback gradient when image not found
    return (
      <div
        onClick={onClick}
        className={`relative overflow-hidden cursor-pointer bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center ${className}`}
      >
        <span className="text-white text-sm font-medium text-center px-2">
          {name}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer ${className}`}
    >
      <OptimizedImage
        src={`${basePath}/${slug}.jpg`}
        webp={`${basePath}/${slug}.webp`}
        alt={alt}
        width={240}
        height={240}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
