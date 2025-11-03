import React from 'react';

interface ClusterMarkerProps {
  pointCount: number;
  onClick: () => void;
}

/**
 * PHASE 2.3: Cluster Marker Component
 * Displays number of stores in a cluster
 * Click to zoom in and expand cluster
 */
export const ClusterMarker = React.memo(({ pointCount, onClick }: ClusterMarkerProps) => {
  // Size based on point count
  const size = pointCount < 10 ? 40 : pointCount < 50 ? 50 : 60;
  const fontSize = pointCount < 10 ? 'text-sm' : pointCount < 50 ? 'text-base' : 'text-lg';

  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer transform transition-transform hover:scale-110 active:scale-95"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      aria-label={`Cluster of ${pointCount} stores. Click to expand.`}
    >
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-pulse"
        style={{
          width: `${size + 10}px`,
          height: `${size + 10}px`,
          left: '-5px',
          top: '-5px',
        }}
      />

      {/* Main cluster circle */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg border-4 border-white"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      />

      {/* Count text */}
      <span className={`relative z-10 font-bold text-white ${fontSize}`}>
        {pointCount}
      </span>
    </button>
  );
});

ClusterMarker.displayName = 'ClusterMarker';
