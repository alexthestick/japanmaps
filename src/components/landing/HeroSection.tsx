import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Map, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ikUrl } from '../../utils/ikUrl';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroFind {
  id: string;
  photo_url: string;
  store_name: string;
  city: string;
}

// ─── Photo Mosaic ─────────────────────────────────────────────────────────────

function PhotoMosaic({ photos }: { photos: HeroFind[] }) {
  // Fill to 6 slots — repeat if fewer
  const slots = Array.from({ length: 6 }, (_, i) => photos[i % photos.length]);

  const delays = [0, 0.1, 0.2, 0.05, 0.15, 0.25];
  const rotations = [-2, 1.5, -1, 2.5, -1.5, 1];

  return (
    <div className="grid grid-cols-3 grid-rows-2 gap-2 h-full">
      {slots.map((photo, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.92, rotate: rotations[i] * 2 }}
          animate={{ opacity: 1, scale: 1, rotate: rotations[i] }}
          transition={{ duration: 0.8, delay: 0.4 + delays[i], ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-xl"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.6)' }}
        >
          <img
            src={ikUrl(photo.photo_url, 'thumb')}
            alt={photo.store_name}
            loading="eager"
            className="w-full h-full object-cover"
          />
          {/* subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* city label */}
          <div className="absolute bottom-2 left-2 text-[9px] font-black text-white/60 uppercase tracking-widest font-mono">
            {photo.city}
          </div>
          {/* film corner marks */}
          <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-white/20" />
          <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-white/20" />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Skeleton mosaic while loading ────────────────────────────────────────────

function MosaicSkeleton() {
  return (
    <div className="grid grid-cols-3 grid-rows-2 gap-2 h-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-gray-900/80 animate-pulse"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

export function HeroSection() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  const [isLoaded, setIsLoaded] = useState(false);
  const [photos, setPhotos] = useState<HeroFind[]>([]);

  useEffect(() => {
    setIsLoaded(true);
    // Fetch 6 recent approved finds with photos
    supabase
      .from('field_notes')
      .select('id, photo_url, store_name, city')
      .eq('status', 'approved')
      .not('photo_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data && data.length > 0) setPhotos(data as HeroFind[]);
      });
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-black">

      {/* ── Background: gradient orbs + map lines + film grain ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-blue-500/20" />

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
        />

        {/* Map lines */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="map-lines" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <line x1="0" y1="50" x2="200" y2="50" stroke="#22D9EE" strokeWidth="0.5" opacity="0.5" />
                <line x1="0" y1="100" x2="200" y2="100" stroke="#3B82F6" strokeWidth="0.5" opacity="0.5" />
                <line x1="0" y1="150" x2="200" y2="150" stroke="#A855F7" strokeWidth="0.5" opacity="0.5" />
                <line x1="50" y1="0" x2="50" y2="200" stroke="#22D9EE" strokeWidth="0.5" opacity="0.5" />
                <line x1="100" y1="0" x2="100" y2="200" stroke="#3B82F6" strokeWidth="0.5" opacity="0.5" />
                <line x1="150" y1="0" x2="150" y2="200" stroke="#A855F7" strokeWidth="0.5" opacity="0.5" />
                <line x1="0" y1="0" x2="50" y2="50" stroke="#22D9EE" strokeWidth="1" opacity="0.3" />
                <line x1="150" y1="150" x2="200" y2="200" stroke="#A855F7" strokeWidth="1" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-lines)" />
          </svg>
        </div>

        {/* Cross pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322D9EE' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Film grain */}
        <div className="absolute inset-0 film-grain" />
      </div>

      {/* ── Content ── */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex min-h-screen flex-col lg:flex-row items-center justify-center gap-12 px-6 md:px-12 lg:px-20 py-24"
      >
        {/* ── Left: Text + CTAs ── */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 16 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 mb-6"
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
            />
            <span className="text-xs font-bold text-cyan-300/70 uppercase tracking-widest">
              Japan's Vintage & Archive Map
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight italic transform -skew-x-3 leading-none mb-6"
            style={{
              textShadow: '0 0 40px rgba(34, 217, 238, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)',
              WebkitTextStroke: '1px rgba(34, 217, 238, 0.2)',
            }}
          >
            LOST IN<br />TRANSIT
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg text-gray-400 leading-relaxed mb-10 max-w-md"
          >
            1,040+ curated vintage, archive, and streetwear stores across Japan. Discovered and shared by the community.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
          >
            <button
              onClick={() => navigate('/map')}
              className="flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white font-black text-sm uppercase tracking-wider rounded-xl hover:scale-105 transition-all duration-300 border border-cyan-300/30"
              style={{ boxShadow: '0 0 30px rgba(34, 217, 238, 0.35), 0 8px 32px rgba(0,0,0,0.4)' }}
            >
              <Map className="w-4 h-4" />
              Explore the Map
            </button>

            <button
              onClick={() => navigate('/finds')}
              className="flex items-center justify-center gap-2.5 px-8 py-4 bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-wider rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              Browse Finds
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* ── Right: Photo Mosaic ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 40 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 w-full max-w-xl lg:max-w-none"
          style={{ height: '480px' }}
        >
          {photos.length >= 3 ? (
            <PhotoMosaic photos={photos} />
          ) : (
            <MosaicSkeleton />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
