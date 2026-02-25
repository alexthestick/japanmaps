import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ITEMS = [
  'TOKYO', 'OSAKA', 'KYOTO', 'VINTAGE', 'STREETWEAR',
  'ARCHIVE', 'SHIMOKITAZAWA', 'HARAJUKU', 'SECOND HAND',
  'NAKAMEGURO', 'OMOTESANDO', 'HIDDEN GEMS', 'JAPAN',
];

// Duplicate enough times to fill any screen width seamlessly
const TRACK = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];

const DOT = (
  <span className="mx-4 text-cyan-400/50 text-xs select-none">◆</span>
);

export function MarqueeTicker() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // Subtle parallax speed boost as user scrolls past
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden bg-black border-y border-cyan-400/10 py-3 select-none"
      style={{ boxShadow: '0 0 30px rgba(34,217,238,0.04) inset' }}
    >
      {/* Left + right fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
           style={{ background: 'linear-gradient(to right, #000, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
           style={{ background: 'linear-gradient(to left, #000, transparent)' }} />

      {/* Scrolling track */}
      <motion.div
        style={{ x }}
        className="flex items-center whitespace-nowrap"
      >
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
          className="flex items-center"
        >
          {TRACK.map((item, i) => (
            <span key={i} className="flex items-center">
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-500 hover:text-cyan-300 transition-colors duration-300 cursor-default">
                {item}
              </span>
              {DOT}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
