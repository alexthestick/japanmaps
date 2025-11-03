import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Map, List, MapPin, Layers, BookOpen, Shirt, Coffee, Utensils, Home, Building2 } from 'lucide-react';

interface TicketCardProps {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  href: string;
  rotation: number;
  position: { top?: string; left?: string; right?: string; bottom?: string };
  size: 'small' | 'medium' | 'large';
}

function TicketCard({ title, icon, gradient, href, rotation, position, size }: TicketCardProps) {
  const navigate = useNavigate();

  const sizeClasses = {
    small: 'w-56 h-32',
    medium: 'w-64 h-36',
    large: 'w-72 h-40'
  };

  return (
    <motion.button
      onClick={() => navigate(href)}
      initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
      whileInView={{ opacity: 1, scale: 1, rotate: rotation }}
      viewport={{ once: true }}
      whileHover={{
        scale: 1.05,
        rotate: rotation + 3,
        zIndex: 50
      }}
      transition={{
        duration: 0.3,
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className={`absolute ${sizeClasses[size]} group cursor-pointer`}
      style={position}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Ticket body */}
      <div className={`relative h-full bg-gray-900/90 backdrop-blur-sm rounded-2xl border-2 border-white/20 group-hover:border-white/40 transition-all duration-300 overflow-hidden`}>
        {/* Film grain */}
        <div className="absolute inset-0 film-grain opacity-20" />

        {/* Perforated edge (left side) */}
        <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col justify-around py-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-black/40 mx-auto" />
          ))}
        </div>

        {/* Ticket punch holes (right side) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 rounded-full border-2 border-white/30" />
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center justify-center pl-8 pr-10 gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>

          {/* Title */}
          <div className="flex-1">
            <h3 className="text-lg font-black text-white uppercase tracking-wide italic transform -skew-x-3 group-hover:text-cyan-300 transition-colors duration-300"
                style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
              {title}
            </h3>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-2 left-8 w-2 h-2 border-t border-l border-cyan-400/50" />
        <div className="absolute bottom-2 left-8 w-2 h-2 border-b border-l border-cyan-400/50" />
      </div>
    </motion.button>
  );
}

export function TrainTicketMenu() {
  return (
    <section className="relative py-20 px-8 bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
      {/* Film grain */}
      <div className="absolute inset-0 film-grain opacity-20" />

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322D9EE' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <h2 className="text-5xl md:text-6xl font-black text-white mb-4 italic transform -skew-x-3"
            style={{ textShadow: '0 0 30px rgba(34, 217, 238, 0.4)' }}>
          START YOUR JOURNEY
        </h2>
        <p className="text-xl text-gray-400">Choose your path through Japan</p>
      </motion.div>

      {/* Ticket Cards Container */}
      <div className="relative max-w-7xl mx-auto h-[800px]">
        {/* Navigation Cards */}
        <TicketCard
          title="Map View"
          icon={<Map className="w-6 h-6" />}
          gradient="from-cyan-400 to-blue-500"
          href="/map"
          rotation={-3}
          position={{ top: '5%', left: '5%' }}
          size="large"
        />

        <TicketCard
          title="List View"
          icon={<List className="w-6 h-6" />}
          gradient="from-blue-400 to-purple-500"
          href="/map"
          rotation={2}
          position={{ top: '5%', right: '15%' }}
          size="medium"
        />

        <TicketCard
          title="Cities"
          icon={<Building2 className="w-6 h-6" />}
          gradient="from-purple-400 to-pink-500"
          href="/cities"
          rotation={-4}
          position={{ top: '30%', left: '15%' }}
          size="medium"
        />

        <TicketCard
          title="Neighborhoods"
          icon={<MapPin className="w-6 h-6" />}
          gradient="from-cyan-400 to-teal-500"
          href="/neighborhoods"
          rotation={3}
          position={{ top: '25%', right: '5%' }}
          size="large"
        />

        <TicketCard
          title="Blog"
          icon={<BookOpen className="w-6 h-6" />}
          gradient="from-pink-400 to-purple-500"
          href="/blog"
          rotation={-2}
          position={{ bottom: '35%', left: '8%' }}
          size="small"
        />

        {/* Category Cards */}
        <TicketCard
          title="Fashion"
          icon={<Shirt className="w-6 h-6" />}
          gradient="from-cyan-500 to-blue-600"
          href="/map?category=Fashion"
          rotation={4}
          position={{ bottom: '40%', right: '12%' }}
          size="medium"
        />

        <TicketCard
          title="Food"
          icon={<Utensils className="w-6 h-6" />}
          gradient="from-orange-400 to-red-500"
          href="/map?category=Food"
          rotation={-3}
          position={{ bottom: '15%', left: '20%' }}
          size="medium"
        />

        <TicketCard
          title="Coffee"
          icon={<Coffee className="w-6 h-6" />}
          gradient="from-amber-400 to-orange-500"
          href="/map?category=Coffee"
          rotation={2}
          position={{ bottom: '8%', left: '50%', right: 'auto' }}
          size="small"
        />

        <TicketCard
          title="Home Goods"
          icon={<Home className="w-6 h-6" />}
          gradient="from-green-400 to-teal-500"
          href="/map?category=Home+Goods"
          rotation={-4}
          position={{ bottom: '20%', right: '8%' }}
          size="medium"
        />

        <TicketCard
          title="Museums"
          icon={<Layers className="w-6 h-6" />}
          gradient="from-indigo-400 to-purple-500"
          href="/map?category=Museums"
          rotation={3}
          position={{ top: '55%', left: '45%' }}
          size="small"
        />
      </div>
    </section>
  );
}
