import React from 'react';

interface WashiTextureProps {
  opacity?: number;
  className?: string;
}

/**
 * Washi paper texture overlay component
 * Creates a subtle paper-like texture effect at 3-8% opacity
 * Used for Neo-Tokyo aesthetic
 */
export function WashiTexture({ opacity = 0.05, className = '' }: WashiTextureProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `
          url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" seed="2"/></filter></defs><rect width="400" height="400" fill="%23f5f5f5"/><rect width="400" height="400" fill="%23000000" opacity="0.05" filter="url(%23noise)"/></svg>')
        `,
        backgroundRepeat: 'repeat',
        opacity,
      }}
    />
  );
}
