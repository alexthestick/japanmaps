interface OptimizedImageProps {
  src: string;
  webp: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  onError?: () => void;
}

export function OptimizedImage({
  src,
  webp,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  onError,
}: OptimizedImageProps) {
  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        onError={onError}
      />
    </picture>
  );
}
