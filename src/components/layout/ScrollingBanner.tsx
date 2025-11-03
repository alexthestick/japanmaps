import { useEffect, useState } from 'react';
import { useStores } from '../../hooks/useStores';

export function ScrollingBanner() {
  const { stores } = useStores({ countries: [], cities: [], categories: [], priceRanges: [], searchQuery: '', selectedCity: null, selectedNeighborhood: null, selectedCategory: null });
  const storeCount = stores.length;

  const message = `Welcome to Lost in Transit v1.0 • We currently have ${storeCount} stores and will continue updating • Enjoy exploring Japan's best spots`;

  return (
    <div className="relative w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 border-y-2 border-orange-500/40 overflow-hidden">
      {/* Film grain */}
      <div className="absolute inset-0 film-grain opacity-30 pointer-events-none" />

      {/* LED grid pattern background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255, 165, 0, 0.3) 1px, transparent 1px)',
          backgroundSize: '4px 4px'
        }}
      />

      {/* Corner brackets - train station style */}
      <div className="absolute top-1 left-2 w-4 h-4 border-t-2 border-l-2 border-orange-400/60" />
      <div className="absolute top-1 right-2 w-4 h-4 border-t-2 border-r-2 border-orange-400/60" />
      <div className="absolute bottom-1 left-2 w-4 h-4 border-b-2 border-l-2 border-orange-400/60" />
      <div className="absolute bottom-1 right-2 w-4 h-4 border-b-2 border-r-2 border-orange-400/60" />

      {/* Scrolling text container */}
      <div className="relative py-3 overflow-hidden">
        <div className="scrolling-text flex whitespace-nowrap">
          {/* Repeat message multiple times for seamless loop */}
          <span className="inline-block px-8 text-orange-400 font-bold text-sm tracking-wider" style={{
            textShadow: '0 0 12px rgba(251, 146, 60, 0.8), 0 0 4px rgba(251, 146, 60, 0.4)',
            fontFamily: 'monospace'
          }}>
            {message}
          </span>
          <span className="inline-block px-8 text-orange-400 font-bold text-sm tracking-wider" style={{
            textShadow: '0 0 12px rgba(251, 146, 60, 0.8), 0 0 4px rgba(251, 146, 60, 0.4)',
            fontFamily: 'monospace'
          }}>
            {message}
          </span>
          <span className="inline-block px-8 text-orange-400 font-bold text-sm tracking-wider" style={{
            textShadow: '0 0 12px rgba(251, 146, 60, 0.8), 0 0 4px rgba(251, 146, 60, 0.4)',
            fontFamily: 'monospace'
          }}>
            {message}
          </span>
        </div>
      </div>

      {/* Add pulsing effect on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent pointer-events-none" />

      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .scrolling-text {
          animation: scroll-left 30s linear infinite;
        }

        .scrolling-text:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
