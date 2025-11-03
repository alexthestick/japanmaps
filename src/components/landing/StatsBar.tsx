import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Map, Store, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StatItemProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  color: 'cyan' | 'blue' | 'purple';
}

function StatItem({ value, label, icon, color }: StatItemProps) {
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

  const colorClasses = {
    cyan: {
      border: 'border-cyan-400/30 group-hover:border-cyan-400/60',
      bg: 'bg-cyan-500/20',
      icon: 'text-cyan-400',
      gradient: 'from-cyan-500/20 via-blue-500/20 to-purple-500/20',
      shadow: 'rgba(34, 217, 238, 0.5)',
      corner: 'border-cyan-400/50'
    },
    blue: {
      border: 'border-blue-400/30 group-hover:border-blue-400/60',
      bg: 'bg-blue-500/20',
      icon: 'text-blue-400',
      gradient: 'from-blue-500/20 via-purple-500/20 to-cyan-500/20',
      shadow: 'rgba(59, 130, 246, 0.5)',
      corner: 'border-blue-400/50'
    },
    purple: {
      border: 'border-purple-400/30 group-hover:border-purple-400/60',
      bg: 'bg-purple-500/20',
      icon: 'text-purple-400',
      gradient: 'from-purple-500/20 via-cyan-500/20 to-blue-500/20',
      shadow: 'rgba(168, 85, 247, 0.5)',
      corner: 'border-purple-400/50'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500`} />
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border-2 ${colors.border} transition-all duration-300`}
      >
        {/* Corner decorations */}
        <div className={`absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 ${colors.corner}`} />
        <div className={`absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 ${colors.corner}`} />
        <div className={`absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 ${colors.corner}`} />
        <div className={`absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 ${colors.corner}`} />

        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <div className={colors.icon}>{icon}</div>
          </div>
          <div className="text-5xl font-black text-white mb-2 italic" style={{ textShadow: `0 0 20px ${colors.shadow}` }}>
            <motion.span>{displayValue}</motion.span>
          </div>
          <div className="text-lg font-medium text-gray-400 uppercase tracking-wide">{label}</div>
        </div>
      </motion.div>
    </div>
  );
}

export function StatsBar() {
  const [totalStores, setTotalStores] = useState(0);
  const [totalCities, setTotalCities] = useState(0);
  const [totalNeighborhoods, setTotalNeighborhoods] = useState(0);

  useEffect(() => {
    // Fetch total stores
    supabase
      .from('stores')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => {
        if (count) setTotalStores(count);
      });

    // Fetch total unique cities
    supabase
      .from('stores')
      .select('city')
      .then(({ data }) => {
        if (data) {
          const uniqueCities = new Set(data.map(s => s.city));
          setTotalCities(uniqueCities.size);
        }
      });

    // Fetch total unique neighborhoods
    supabase
      .from('stores')
      .select('neighborhood')
      .not('neighborhood', 'is', null)
      .then(({ data }) => {
        if (data) {
          const uniqueNeighborhoods = new Set(data.map(s => s.neighborhood));
          setTotalNeighborhoods(uniqueNeighborhoods.size);
        }
      });
  }, []);

  return (
    <section className="relative py-16 px-8 bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Film grain overlay */}
      <div className="absolute inset-0 film-grain opacity-30" />

      <div className="relative max-w-6xl mx-auto">
        {/* Updated Daily Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-medium text-cyan-300 uppercase tracking-wider">Updated Daily</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatItem
            value={totalCities}
            label="Cities"
            icon={<Map className="w-8 h-8" />}
            color="cyan"
          />
          <StatItem
            value={totalStores}
            label="Stores"
            icon={<Store className="w-8 h-8" />}
            color="blue"
          />
          <StatItem
            value={totalNeighborhoods}
            label="Neighborhoods"
            icon={<MapPin className="w-8 h-8" />}
            color="purple"
          />
        </div>
      </div>
    </section>
  );
}
