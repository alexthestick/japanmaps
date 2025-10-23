import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface StatItemProps {
  value: number;
  label: string;
  suffix?: string;
}

function StatItem({ value, label, suffix = '' }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const displayValue = useMotionValue('0');

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      displayValue.set(Math.floor(latest).toLocaleString());
    });
    return unsubscribe;
  }, [springValue, displayValue]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <div className="font-display text-4xl font-bold text-accent md:text-5xl lg:text-6xl">
        <motion.span>{displayValue}</motion.span>
        {suffix}
      </div>
      <p className="mt-2 text-sm font-medium uppercase tracking-wider text-primary-600">
        {label}
      </p>
    </motion.div>
  );
}

export function StatsBar() {
  return (
    <section className="border-y border-primary-200 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-3 gap-8 md:gap-16">
          <StatItem value={265} label="Curated Stores" suffix="+" />
          <StatItem value={12} label="Cities" />
          <StatItem value={4} label="Categories" />
        </div>
      </div>
    </section>
  );
}
