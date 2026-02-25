import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { generateFindSlug, getDisplayUsername } from '../../utils/slugify';
import { ikUrl } from '../../utils/ikUrl';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CommunityFind {
  id: string;
  type: 'visit' | 'haul';
  username: string;
  avatar_color: string; // fallback color if no avatar photo
  photo_url: string;
  store_name: string;
  store_slug: string;
  neighborhood: string;
  city: string;
  caption?: string;
  item_name?: string; // for haul posts: what was bought
  created_at: string; // relative label e.g. "2 days ago"
}

// ─── Seed data (Phase 1 — replace photo_url with your real photos) ────────────
// To update: swap photo_url with your real image URLs (Supabase storage, Imgur, etc.)
// Format for you to fill in:
//   visit post → photo of the store exterior or interior
//   haul post  → photo of the item you bought

const SEED_NOTES: CommunityFind[] = [
  {
    id: '1',
    type: 'haul',
    username: 'alexc',
    avatar_color: '#22d9ee',
    photo_url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80',
    store_name: 'BerBerJin',
    store_slug: 'berberjin',
    neighborhood: 'Harajuku',
    city: 'Tokyo',
    item_name: 'Vintage Levi\'s 501',
    caption: 'Found these in the basement rack. Perfect fade.',
    created_at: '2 days ago',
  },
  {
    id: '2',
    type: 'visit',
    username: 'alexc',
    avatar_color: '#22d9ee',
    photo_url: 'https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=600&q=80',
    store_name: 'Komehyo',
    store_slug: 'komehyo-shinjuku',
    neighborhood: 'Shinjuku',
    city: 'Tokyo',
    caption: 'Three floors of archive. Go early.',
    created_at: '4 days ago',
  },
  {
    id: '3',
    type: 'haul',
    username: 'alexc',
    avatar_color: '#22d9ee',
    photo_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    store_name: 'Ragtag',
    store_slug: 'ragtag-shimokitazawa',
    neighborhood: 'Shimokitazawa',
    city: 'Tokyo',
    item_name: 'Nike ACG Jacket',
    caption: 'Couldn\'t leave without it.',
    created_at: '1 week ago',
  },
  {
    id: '4',
    type: 'visit',
    username: 'alexc',
    avatar_color: '#22d9ee',
    photo_url: 'https://images.unsplash.com/photo-1558171813-0ccd6e4c0776?w=600&q=80',
    store_name: 'Chicago Osaka',
    store_slug: 'chicago-osaka',
    neighborhood: 'Amerikamura',
    city: 'Osaka',
    caption: 'Osaka vintage scene is slept on.',
    created_at: '2 weeks ago',
  },
  {
    id: '5',
    type: 'haul',
    username: 'alexc',
    avatar_color: '#22d9ee',
    photo_url: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&q=80',
    store_name: 'Kinji',
    store_slug: 'kinji-harajuku',
    neighborhood: 'Harajuku',
    city: 'Tokyo',
    item_name: 'Issey Miyake Pleats',
    caption: 'Best price I\'ve seen for these.',
    created_at: '3 weeks ago',
  },
  {
    id: '6',
    type: 'visit',
    username: 'alexc',
    avatar_color: '#22d9ee',
    photo_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80',
    store_name: 'New York Joe Exchange',
    store_slug: 'new-york-joe-exchange',
    neighborhood: 'Shimokitazawa',
    city: 'Tokyo',
    caption: 'The weight-based pricing is unbeatable.',
    created_at: '1 month ago',
  },
  {
    id: '7',
    type: 'haul',
    username: 'alexc',
    avatar_color: '#22d9ee',
    photo_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
    store_name: 'Flamingo',
    store_slug: 'flamingo-harajuku',
    neighborhood: 'Harajuku',
    city: 'Tokyo',
    item_name: 'Vintage Band Tee',
    caption: 'Scored this for ¥2,200.',
    created_at: '1 month ago',
  },
  {
    id: '8',
    type: 'visit',
    username: 'alexc',
    avatar_color: '#22d9ee',
    photo_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80',
    store_name: 'Pigsty',
    store_slug: 'pigsty-shimokitazawa',
    neighborhood: 'Shimokitazawa',
    city: 'Tokyo',
    caption: 'Hidden gem down the side street.',
    created_at: '6 weeks ago',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

// ─── Field Note Card ──────────────────────────────────────────────────────────

interface NoteCardProps {
  note: CommunityFind;
  index: number;
}

function NoteCard({ note, index }: NoteCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const navigate = useNavigate();

  const isVisit = note.type === 'visit';
  const typeColor = isVisit ? '#22d9ee' : '#a855f7';
  const typeGlow = isVisit ? 'rgba(34,217,238,0.5)' : 'rgba(168,85,247,0.5)';
  const TypeIcon = isVisit ? MapPin : ShoppingBag;
  const typeLabel = isVisit ? 'VISITED' : 'PICKED UP';

  function handleClick() {
    window.scrollTo(0, 0);
    // If it's a UUID (real find), go to find detail with SEO slug; otherwise go to store
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(note.id);
    if (isUUID) {
      navigate(`/finds/${generateFindSlug(note)}`);
    } else {
      navigate(`/store/${note.store_slug}`);
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
        delay: (index % 4) * 0.07,
      }}
      onClick={handleClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-gray-900"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
      whileHover={{ y: -4, boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px ${typeColor}30` }}
    >
      {/* ── Photo ── */}
      <div className="relative w-full overflow-hidden" style={{ paddingBottom: '125%' }}>
        <img
          src={ikUrl(note.photo_url, 'thumb')}
          alt={note.store_name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Top-left type badge */}
        <div className="absolute top-3 left-3 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: (index % 4) * 0.07 + 0.2, duration: 0.3 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest"
            style={{
              backgroundColor: `${typeColor}20`,
              border: `1px solid ${typeColor}60`,
              color: typeColor,
              boxShadow: `0 0 12px ${typeGlow}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <TypeIcon className="w-3 h-3" />
            {typeLabel}
          </motion.div>
        </div>

        {/* Film corner marks */}
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/15" />
        <div className="absolute bottom-[88px] right-2 w-3 h-3 border-b border-r border-white/15" />

        {/* ── Bottom overlay content ── */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Avatar + username */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-black shrink-0"
              style={{ backgroundColor: note.avatar_color }}
            >
              {getInitials(note.username)}
            </div>
            <span className="text-white/70 text-xs font-mono">@{note.username}</span>
            <span className="text-white/30 text-[10px] ml-auto">{note.created_at}</span>
          </div>

          {/* Store + neighborhood */}
          <div className="flex items-baseline gap-1.5 mb-1">
            <span
              className="text-sm font-black text-white group-hover:text-cyan-100 transition-colors duration-300 leading-tight"
            >
              {note.store_name}
            </span>
            <span className="text-white/40 text-[10px] font-mono shrink-0">· {note.neighborhood}</span>
          </div>

          {/* Item name (haul only) */}
          {note.item_name && (
            <div
              className="text-[11px] font-bold mb-1"
              style={{ color: typeColor }}
            >
              {note.item_name}
            </div>
          )}

          {/* Caption */}
          {note.caption && (
            <p className="text-white/50 text-[11px] leading-relaxed line-clamp-1">
              {note.caption}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function CommunityFinds() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-40px' });
  const [liveNotes, setLiveNotes] = useState<CommunityFind[]>([]);
  const [loadingLive, setLoadingLive] = useState(true);

  useEffect(() => {
    supabase
      .from('field_notes')
      .select('id, user_id, type, photo_url, store_name, store_id, neighborhood, city, item_name, caption, created_at, profiles(username, display_name)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const mapped: CommunityFind[] = data.map((n: any) => ({
            id: n.id,
            type: n.type,
            username: getDisplayUsername(n.profiles, n.user_id),
            avatar_color: '#a855f7',
            photo_url: n.photo_url || '',
            store_name: n.store_name,
            store_slug: n.store_id || n.id,
            neighborhood: n.neighborhood || n.city,
            city: n.city,
            caption: n.caption,
            item_name: n.item_name,
            created_at: (() => {
              const diff = Date.now() - new Date(n.created_at).getTime();
              const days = Math.floor(diff / 86400000);
              if (days === 0) return 'Today';
              if (days === 1) return 'Yesterday';
              if (days < 30) return `${days}d ago`;
              if (days < 365) return `${Math.floor(days / 30)}mo ago`;
              return `${Math.floor(days / 365)}y ago`;
            })(),
          }));
          setLiveNotes(mapped);
        }
        setLoadingLive(false);
      });
  }, []);

  // Use live data if available, fall back to seed data
  const displayNotes = liveNotes.length > 0 ? liveNotes : (loadingLive ? [] : SEED_NOTES);

  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #000000, #05080f, #07111f, #05080f, #000000)' }}
    >
      {/* Dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(168,85,247,0.06) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        }}
      />

      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/4 rounded-full blur-3xl" />
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
            {/* Live indicator */}
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-purple-400"
              />
              <span className="text-[11px] font-bold text-purple-300/70 uppercase tracking-widest">
                From the community
              </span>
            </div>

            <h2
              className="text-4xl md:text-5xl font-black italic text-white tracking-tight"
              style={{ textShadow: '0 0 30px rgba(168,85,247,0.2)' }}
            >
              FINDS
            </h2>
            <p className="mt-2 text-gray-500 text-base">
              Real visits. Real pickups. Real Japan.
            </p>
          </div>

          {/* View all CTA */}
          <motion.button
            onClick={() => navigate('/finds')}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
            className="hidden md:flex items-center gap-2 text-purple-400/70 hover:text-purple-300 text-sm font-bold uppercase tracking-widest transition-colors duration-200"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* ── Masonry Grid ── */}
        {/*
          CSS columns masonry — 4 cols desktop, 2 cols mobile.
          Cards break naturally by height giving a Pinterest-style layout.
        */}
        {loadingLive ? (
          <div className="columns-2 md:columns-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid mb-4 rounded-xl bg-gray-900/50 animate-pulse"
                style={{ height: `${240 + (i % 3) * 60}px` }}
              />
            ))}
          </div>
        ) : (
          <div
            className="columns-2 md:columns-4 gap-4"
            style={{ columnFill: 'balance' }}
          >
            {displayNotes.map((note, index) => (
              <div key={note.id} className="break-inside-avoid mb-4">
                <NoteCard note={note} index={index} />
              </div>
            ))}
          </div>
        )}

        {/* ── Mobile view all ── */}
        <div className="flex justify-center mt-10 md:hidden">
          <motion.button
            onClick={() => navigate('/finds')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-8 py-3 border border-purple-400/40 text-purple-300 font-black italic text-sm uppercase tracking-wider rounded-sm"
          >
            View all finds
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* ── Submit CTA strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-6 rounded-2xl border border-white/5"
          style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(8px)' }}
        >
          <div>
            <p className="text-white font-black italic text-lg mb-1">
              Been to a store? Found something rare?
            </p>
            <p className="text-gray-500 text-sm">
              Share your finds and help others discover hidden gems.
            </p>
          </div>
          <motion.button
            onClick={() => navigate('/finds')}
            whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(168,85,247,0.3)' }}
            whileTap={{ scale: 0.97 }}
            className="shrink-0 px-7 py-3 bg-purple-500/20 border border-purple-400/50 text-purple-300 font-black italic text-sm uppercase tracking-wider rounded-sm hover:bg-purple-500/30 transition-colors duration-200"
          >
            Submit a Find
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}
