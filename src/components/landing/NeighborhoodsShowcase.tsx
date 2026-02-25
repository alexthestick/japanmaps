import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { neighborhoodToSlug } from '../../utils/cityData';

interface NeighborhoodData {
  name: string;
  city: string;
  storeCount: number;
  vibe: string;
  accentColor: string;
  glowColor: string;
}

// Curated top neighborhoods with vibes — sorted by store count at runtime
const FEATURED_NEIGHBORHOODS: Omit<NeighborhoodData, 'storeCount'>[] = [
  {
    name: 'Shimokitazawa',
    city: 'Tokyo',
    vibe: 'Vintage & indie',
    accentColor: '#22d9ee',
    glowColor: 'rgba(34,217,238,0.3)',
  },
  {
    name: 'Harajuku',
    city: 'Tokyo',
    vibe: 'Streetwear & archive',
    accentColor: '#a855f7',
    glowColor: 'rgba(168,85,247,0.3)',
  },
  {
    name: 'Nakameguro',
    city: 'Tokyo',
    vibe: 'Designer & boutique',
    accentColor: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.3)',
  },
  {
    name: 'Shinjuku',
    city: 'Tokyo',
    vibe: 'Department & consignment',
    accentColor: '#22d9ee',
    glowColor: 'rgba(34,217,238,0.3)',
  },
  {
    name: 'Amerikamura',
    city: 'Osaka',
    vibe: 'Osaka street culture',
    accentColor: '#f97316',
    glowColor: 'rgba(249,115,22,0.3)',
  },
  {
    name: 'Omotesando',
    city: 'Tokyo',
    vibe: 'Luxury & concept stores',
    accentColor: '#a855f7',
    glowColor: 'rgba(168,85,247,0.3)',
  },
  {
    name: 'Koenji',
    city: 'Tokyo',
    vibe: 'Underground vintage',
    accentColor: '#22d9ee',
    glowColor: 'rgba(34,217,238,0.3)',
  },
  {
    name: 'Daikanyama',
    city: 'Tokyo',
    vibe: 'Curated & minimal',
    accentColor: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.3)',
  },
];

// ─── Single Neighborhood Card ─────────────────────────────────────────────────

interface NeighborhoodCardProps {
  data: NeighborhoodData;
  index: number;
  isFeatured: boolean; // first card gets larger treatment
}

function NeighborhoodCard({ data, index, isFeatured }: NeighborhoodCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const navigate = useNavigate();

  function handleClick() {
    const citySlug = encodeURIComponent(data.city.toLowerCase());
    const neighborhoodSlug = neighborhoodToSlug(data.name);
    navigate(`/city/${citySlug}/${neighborhoodSlug}`);
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: (index % 4) * 0.08,
      }}
      onClick={handleClick}
      className={`group relative cursor-pointer rounded-2xl border border-white/5 hover:border-white/15 transition-all duration-300 overflow-hidden ${isFeatured ? 'md:col-span-2 md:row-span-2' : ''}`}
      style={{ background: 'rgba(255,255,255,0.02)' }}
      whileHover={{
        y: -4,
        boxShadow: `0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px ${data.accentColor}30`,
      }}
    >
      {/* Accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(to right, transparent, ${data.accentColor}, transparent)`,
          opacity: 0.6,
        }}
      />

      {/* Hover glow fill */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${data.glowColor}, transparent 70%)` }}
      />

      <div className={`relative p-6 flex flex-col justify-between ${isFeatured ? 'min-h-[240px]' : 'min-h-[160px]'}`}>

        {/* Top row — city tag */}
        <div className="flex items-center justify-between mb-auto">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" style={{ color: data.accentColor }} />
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: data.accentColor }}
            >
              {data.city}
            </span>
          </div>

          {data.storeCount > 0 && (
            <span className="text-[10px] font-mono text-white/30">
              {data.storeCount} stores
            </span>
          )}
        </div>

        {/* Neighborhood name */}
        <div className="mt-4">
          <h3
            className={`font-black italic text-white leading-tight group-hover:text-opacity-90 transition-all duration-300 ${isFeatured ? 'text-4xl md:text-5xl' : 'text-2xl'}`}
            style={{ textShadow: `0 0 20px ${data.glowColor}` }}
          >
            {data.name}
          </h3>

          {/* Vibe tag */}
          <p className="mt-2 text-sm text-white/40 group-hover:text-white/60 transition-colors duration-300">
            {data.vibe}
          </p>
        </div>

        {/* CTA arrow */}
        <div className="mt-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          <span style={{ color: data.accentColor }}>Explore</span>
          <ArrowRight className="w-3.5 h-3.5" style={{ color: data.accentColor }} />
        </div>

        {/* Large decorative number */}
        <div
          className="absolute bottom-4 right-5 text-[80px] font-black italic leading-none pointer-events-none select-none opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-300"
          style={{ color: data.accentColor }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function NeighborhoodsShowcase() {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodData[]>([]);
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

  useEffect(() => {
    // Fetch store counts per neighborhood from Supabase
    supabase
      .from('stores')
      .select('neighborhood')
      .not('neighborhood', 'is', null)
      .then(({ data }) => {
        if (!data) {
          setNeighborhoods(FEATURED_NEIGHBORHOODS.map(n => ({ ...n, storeCount: 0 })));
          return;
        }

        // Count per neighborhood
        const counts: Record<string, number> = {};
        data.forEach(({ neighborhood }) => {
          if (neighborhood) counts[neighborhood] = (counts[neighborhood] || 0) + 1;
        });

        const enriched = FEATURED_NEIGHBORHOODS.map(n => ({
          ...n,
          storeCount: counts[n.name] || 0,
        }));

        setNeighborhoods(enriched);
      });
  }, []);

  if (neighborhoods.length === 0) return null;

  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #000000, #06090f, #080f1a, #06090f, #000000)' }}
    >
      {/* Dot grid — blue tint to differentiate from MetroTimeline (cyan) and FieldNotes (purple) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.06) 1px, transparent 1px)',
          backgroundSize: '38px 38px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        }}
      />

      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* ── Header ── */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[11px] font-bold text-blue-300/70 uppercase tracking-widest">
                By neighborhood
              </span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-black italic text-white tracking-tight"
              style={{ textShadow: '0 0 30px rgba(59,130,246,0.2)' }}
            >
              WHERE TO GO
            </h2>
            <p className="mt-2 text-gray-500 text-base">
              Every neighborhood has its own scene
            </p>
          </div>

          <motion.button
            onClick={() => navigate('/neighborhoods')}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
            className="hidden md:flex items-center gap-2 text-blue-400/70 hover:text-blue-300 text-sm font-bold uppercase tracking-widest transition-colors duration-200"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* ── Grid ── */}
        {/*
          Layout:
          - Featured card (index 0) spans 2 cols × 2 rows on desktop
          - Remaining 7 cards fill the rest
          - Mobile: single column
        */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-auto">
          {neighborhoods.map((n, i) => (
            <NeighborhoodCard
              key={n.name}
              data={n}
              index={i}
              isFeatured={i === 0}
            />
          ))}
        </div>

        {/* Mobile view all */}
        <div className="flex justify-center mt-8 md:hidden">
          <motion.button
            onClick={() => navigate('/neighborhoods')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-8 py-3 border border-blue-400/40 text-blue-300 font-black italic text-sm uppercase tracking-wider rounded-sm"
          >
            View all neighborhoods
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

      </div>
    </section>
  );
}
