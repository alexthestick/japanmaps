import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { BlogPost } from '../../types/blog';

// Category → color mapping
const CATEGORY_COLORS: Record<string, { bg: string; text: string; glow: string; border: string }> = {
  Fashion:     { bg: 'bg-cyan-500',    text: 'text-black',  glow: 'rgba(34,217,238,0.6)',   border: '#22d9ee' },
  Culture:     { bg: 'bg-purple-500',  text: 'text-white',  glow: 'rgba(168,85,247,0.6)',   border: '#a855f7' },
  Food:        { bg: 'bg-orange-500',  text: 'text-black',  glow: 'rgba(249,115,22,0.6)',   border: '#f97316' },
  Guide:       { bg: 'bg-blue-500',    text: 'text-white',  glow: 'rgba(59,130,246,0.6)',   border: '#3b82f6' },
  Streetwear:  { bg: 'bg-cyan-500',    text: 'text-black',  glow: 'rgba(34,217,238,0.6)',   border: '#22d9ee' },
  default:     { bg: 'bg-cyan-500',    text: 'text-black',  glow: 'rgba(34,217,238,0.6)',   border: '#22d9ee' },
};

function getCategoryStyle(category: string | null) {
  return CATEGORY_COLORS[category ?? ''] ?? CATEGORY_COLORS.default;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Image Collage (right side) ───────────────────────────────────────────────

interface ImageCollageProps {
  post: BlogPost;
  isInView: boolean;
  catBorderColor: string;
}

function ImageCollage({ post, isInView, catBorderColor }: ImageCollageProps) {
  // We use the hero_image as primary. For the "behind" ghost photos we
  // use a slight tint variant of the same image — feels like a contact sheet.
  const heroSrc = post.hero_image ?? null;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* ── Shadow / back photo 2 (furthest back) ── */}
      {heroSrc && (
        <motion.div
          initial={{ opacity: 0, rotate: -8, scale: 0.88 }}
          animate={isInView ? { opacity: 0.35, rotate: -6, scale: 0.9 } : {}}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute w-[82%] aspect-[4/3] rounded-lg overflow-hidden"
          style={{
            transformOrigin: 'center bottom',
            top: '8%',
          }}
        >
          <img
            src={heroSrc}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.4) saturate(0.6)' }}
          />
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      )}

      {/* ── Middle photo (slightly rotated) ── */}
      {heroSrc && (
        <motion.div
          initial={{ opacity: 0, rotate: 5, scale: 0.9 }}
          animate={isInView ? { opacity: 0.6, rotate: 4, scale: 0.94 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute w-[86%] aspect-[4/3] rounded-lg overflow-hidden"
          style={{
            transformOrigin: 'center bottom',
            top: '4%',
          }}
        >
          <img
            src={heroSrc}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.55) saturate(0.7)' }}
          />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>
      )}

      {/* ── Primary photo (front) ── */}
      <motion.div
        initial={{ opacity: 0, rotate: -2, y: 16, scale: 0.92 }}
        animate={isInView ? { opacity: 1, rotate: -1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ rotate: 0, scale: 1.02, transition: { duration: 0.3 } }}
        className="relative w-[88%] aspect-[4/3] rounded-lg overflow-hidden cursor-pointer"
        style={{
          boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px ${catBorderColor}40`,
          transformOrigin: 'center bottom',
        }}
      >
        {heroSrc ? (
          <img
            src={heroSrc}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <span className="text-5xl opacity-20">📸</span>
          </div>
        )}

        {/* Neon top edge glow */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(to right, transparent, ${catBorderColor}, transparent)` }}
        />

        {/* Bottom gradient — category tag overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-3 left-3 text-[10px] font-mono text-white/50 tracking-widest uppercase">
          {post.category ?? 'Article'}
        </div>

        {/* Film-frame corner marks */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-white/20" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-white/20" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-white/20" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/20" />
      </motion.div>

      {/* ── Film strip dots (decorative) ── */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-20">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
        ))}
      </div>
    </div>
  );
}

// ─── Station Row ──────────────────────────────────────────────────────────────

interface StationRowProps {
  post: BlogPost;
  index: number;
  isFeatured: boolean;
}

function StationRow({ post, index, isFeatured }: StationRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const navigate = useNavigate();
  const catStyle = getCategoryStyle(post.category);

  function handleNavigate(slug: string) {
    // Force scroll to top before navigating — Lenis can hold scroll position
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    navigate(`/blog/${slug}`);
  }

  return (
    <motion.div
      ref={ref}
      className="relative grid grid-cols-[1fr_80px_1fr] items-center gap-0 w-full"
      style={{ minHeight: '260px' }}
    >
      {/* ══════════ LEFT — Text Card ══════════ */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        onClick={() => handleNavigate(post.slug)}
        className="group relative cursor-pointer bg-gray-900/70 backdrop-blur-sm border border-white/5 hover:border-white/15 rounded-2xl p-7 transition-all duration-300 h-full flex flex-col justify-between"
        style={{
          boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
        }}
        whileHover={{ y: -4, boxShadow: '0 12px 48px rgba(0,0,0,0.6)' }}
      >
        {/* Featured ribbon */}
        {isFeatured && (
          <div
            className="absolute -top-px left-6 right-6 h-[2px] rounded-full"
            style={{ background: `linear-gradient(to right, transparent, ${catStyle.border}, transparent)` }}
          />
        )}

        <div>
          {/* Category + date */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm ${catStyle.bg} ${catStyle.text}`}
              style={{ boxShadow: `0 0 10px ${catStyle.glow}` }}
            >
              {post.category ?? 'Article'}
            </span>
            <span className="text-gray-500 text-xs font-mono tracking-wide">
              {formatDate(post.published_at)}
            </span>
            {isFeatured && (
              <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-cyan-400/70 border border-cyan-400/20 px-2 py-0.5 rounded-sm">
                Latest
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className={`font-black italic text-white leading-tight mb-3 group-hover:text-cyan-100 transition-colors duration-300 ${isFeatured ? 'text-2xl' : 'text-lg'}`}>
            {post.title}
          </h3>

          {/* Excerpt */}
          {(post.intro_content || post.content) && (
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-5">
              {post.intro_content ?? post.content.slice(0, 150)}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold mt-auto pt-2 border-t border-white/5">
          <span className="relative">
            Read article
            <span className="absolute bottom-0 left-0 h-px w-0 bg-cyan-400 group-hover:w-full transition-all duration-300" />
          </span>
          <motion.div
            className="group-hover:translate-x-1 transition-transform duration-200"
          >
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Corner brackets */}
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-white/10 group-hover:border-cyan-400/30 transition-colors duration-300" />
        <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-white/10 group-hover:border-cyan-400/30 transition-colors duration-300" />
      </motion.div>

      {/* ══════════ CENTER — Station marker ══════════ */}
      <div className="flex flex-col items-center justify-center h-full relative">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.15, type: 'spring', stiffness: 220 }}
          className="relative z-10"
        >
          {/* Pulse ring */}
          {isInView && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.8 }}
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: catStyle.border }}
            />
          )}
          <div
            className="w-11 h-11 rounded-full bg-black border-2 flex items-center justify-center font-black text-sm z-10 relative"
            style={{
              borderColor: catStyle.border,
              color: catStyle.border,
              boxShadow: `0 0 18px ${catStyle.glow}, inset 0 0 8px rgba(0,0,0,0.5)`,
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
        </motion.div>

        {/* Horizontal connector lines to both sides */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-px pointer-events-none"
          style={{
            background: `linear-gradient(to right, transparent 0%, ${catStyle.border}40 30%, ${catStyle.border}40 70%, transparent 100%)`,
          }}
        />
      </div>

      {/* ══════════ RIGHT — Image Collage ══════════ */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="flex items-center justify-center h-full py-4"
        style={{ minHeight: '220px' }}
      >
        <ImageCollage post={post} isInView={isInView} catBorderColor={catStyle.border} />
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MetroTimeline() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll-linked traveling dot
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 80%', 'end 20%'],
  });
  const dotY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('id, title, slug, hero_image, content, category, published_at, intro_content, article_type')
      .order('published_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setPosts(data as BlogPost[]);
        setLoading(false);
      });
  }, []);

  if (loading) return null;
  if (posts.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative pt-8 pb-28 overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #000000, #050a12, #07111f, #050a12, #000000)' }}
    >
      {/* Subtle dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(34,217,238,0.07) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        }}
      />

      {/* Horizontal scan lines (very subtle) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)',
        }}
      />

      {/* Ambient glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/6 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-1/3 w-[400px] h-[400px] bg-blue-500/4 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">

        {/* ── Timeline ── */}
        <div className="relative">

          {/* Vertical center line — sits behind the grid */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent, rgba(34,217,238,0.5) 6%, rgba(34,217,238,0.5) 94%, transparent)',
              boxShadow: '0 0 6px rgba(34,217,238,0.25)',
            }}
          />

          {/* Scroll-linked traveling dot */}
          <motion.div
            style={{ top: dotY }}
            className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          >
            <div className="-translate-y-1/2">
              <motion.div
                animate={{ boxShadow: ['0 0 10px rgba(34,217,238,0.8), 0 0 20px rgba(34,217,238,0.4)', '0 0 16px rgba(34,217,238,1), 0 0 32px rgba(34,217,238,0.6)', '0 0 10px rgba(34,217,238,0.8), 0 0 20px rgba(34,217,238,0.4)'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-cyan-300 border border-white/60"
              />
            </div>
          </motion.div>

          {/* Top terminal cap */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 z-10"
            style={{ boxShadow: '0 0 12px rgba(34,217,238,0.9)' }}
          />

          {/* Station rows */}
          <div className="flex flex-col gap-10 py-6">
            {posts.map((post, index) => (
              <StationRow
                key={post.id}
                post={post}
                index={index}
                isFeatured={index === 0}
              />
            ))}
          </div>

          {/* Bottom terminal + CTA */}
          <div className="relative flex flex-col items-center mt-12">
            <div
              className="w-3 h-3 rounded-full bg-cyan-400 mb-5"
              style={{ boxShadow: '0 0 14px rgba(34,217,238,0.9)' }}
            />
            <div className="px-5 py-1.5 border border-cyan-400/25 text-cyan-400/50 text-xs font-mono uppercase tracking-widest mb-10">
              End of Line
            </div>

            <motion.button
              onClick={() => navigate('/blog')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="group flex items-center gap-3 px-10 py-4 border border-cyan-400/50 text-cyan-300 font-black italic text-base uppercase tracking-wider hover:bg-cyan-400/8 hover:border-cyan-400 transition-all duration-300 rounded-sm"
              style={{ boxShadow: '0 0 20px rgba(34,217,238,0.1)' }}
            >
              View All Articles
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
