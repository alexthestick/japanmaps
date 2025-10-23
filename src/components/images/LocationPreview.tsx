import { OptimizedImage } from './OptimizedImage';
import { useState } from 'react';

interface LocationPreviewProps {
  name: string;
  type: 'neighborhood' | 'city';
  alt: string;
  className?: string;
}

export function LocationPreview({
  name,
  type,
  alt,
  className = '',
}: LocationPreviewProps) {
  const [imageError, setImageError] = useState(false);
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const basePath = `/images/${type === 'neighborhood' ? 'neighborhoods' : 'cities'}/preview`;

  if (imageError) {
    // Fallback gradient when image not found
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center ${className}`}
      >
        <span className="text-white text-2xl font-medium">
          {name}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <OptimizedImage
        src={`${basePath}/${slug}-preview.jpg`}
        webp={`${basePath}/${slug}-preview.webp`}
        alt={alt}
        width={840}
        height={1000}
        className="w-full h-full object-cover"
        loading="eager" // Preview should load immediately when hovered
        onError={() => setImageError(true)}
      />
    </div>
  );
}
