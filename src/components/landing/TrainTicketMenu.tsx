import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Map, List, MapPin, Layers, BookOpen, Shirt, Coffee, Utensils, Home, Building2 } from 'lucide-react';

interface TicketCardProps {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  href: string;
  code: string;
}

function TicketCard({ title, icon, gradient, href, code }: TicketCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate first
    navigate(href);
    // Force scroll to top after navigation with a slight delay
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 10);
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{
        scale: 1.03,
        y: -4,
        zIndex: 50
      }}
      transition={{
        duration: 0.3,
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="relative w-full h-36 group cursor-pointer"
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-40 group-hover:opacity-90 transition-all duration-300`} />

      {/* Ticket body */}
      <div className={`relative h-full bg-gray-900/90 backdrop-blur-sm rounded-2xl border-2 border-white/20 group-hover:border-white/50 transition-all duration-300 overflow-hidden`}>
        {/* Film grain */}
        <div className="absolute inset-0 film-grain opacity-20" />

        {/* Jukebox selection code (top-left) */}
        <div className="absolute top-2 left-3 text-xs font-black text-cyan-400/80 group-hover:text-cyan-300 tracking-wider"
             style={{ textShadow: '0 0 8px rgba(34, 217, 238, 0.5)' }}>
          {code}
        </div>

        {/* Perforated edge (left side) */}
        <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col justify-around py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-black/40 mx-auto" />
          ))}
        </div>

        {/* Ticket punch holes (right side) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 rounded-full border-2 border-white/30 group-hover:border-cyan-400/60 transition-colors duration-300" />
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center justify-center pl-8 pr-10 gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}
               style={{ boxShadow: '0 0 15px rgba(0,0,0,0.3)' }}>
            {icon}
          </div>

          {/* Title */}
          <div className="flex-1">
            <h3 className="text-base font-black text-white uppercase tracking-wide italic transform -skew-x-3 group-hover:text-cyan-300 transition-colors duration-300"
                style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
              {title}
            </h3>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-cyan-400/50 group-hover:border-cyan-400/80 transition-colors duration-300" />
        <div className="absolute bottom-2 left-8 w-2 h-2 border-b border-l border-cyan-400/50 group-hover:border-cyan-400/80 transition-colors duration-300" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-purple-400/50 group-hover:border-purple-400/80 transition-colors duration-300" />
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
        className="text-center mb-16"
      >
        <h2 className="text-5xl md:text-6xl font-black text-white mb-4 italic transform -skew-x-3"
            style={{ textShadow: '0 0 30px rgba(34, 217, 238, 0.4)' }}>
          START YOUR JOURNEY
        </h2>
        <p className="text-xl text-gray-400">Choose your path through Japan</p>
      </motion.div>

      {/* Jukebox Grid Container */}
      <div className="relative max-w-5xl mx-auto">
        {/* Navigation Section */}
        <div className="mb-12">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-sm font-bold text-cyan-400/80 uppercase tracking-widest mb-4 ml-2"
            style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}
          >
            Navigation
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TicketCard
              title="Map View"
              icon={<Map className="w-6 h-6" />}
              gradient="from-cyan-400 to-blue-500"
              href="/map"
              code="A1"
            />
            <TicketCard
              title="List View"
              icon={<List className="w-6 h-6" />}
              gradient="from-blue-400 to-purple-500"
              href="/map"
              code="A2"
            />
            <TicketCard
              title="Cities"
              icon={<Building2 className="w-6 h-6" />}
              gradient="from-purple-400 to-pink-500"
              href="/cities"
              code="A3"
            />
            <TicketCard
              title="Neighborhoods"
              icon={<MapPin className="w-6 h-6" />}
              gradient="from-cyan-400 to-teal-500"
              href="/neighborhoods"
              code="B1"
            />
            <TicketCard
              title="Blog"
              icon={<BookOpen className="w-6 h-6" />}
              gradient="from-pink-400 to-purple-500"
              href="/blog"
              code="B2"
            />
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-sm font-bold text-purple-400/80 uppercase tracking-widest mb-4 ml-2"
            style={{ textShadow: '0 0 10px rgba(168, 85, 247, 0.3)' }}
          >
            Categories
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TicketCard
              title="Fashion"
              icon={<Shirt className="w-6 h-6" />}
              gradient="from-cyan-500 to-blue-600"
              href="/map?category=Fashion"
              code="C1"
            />
            <TicketCard
              title="Food"
              icon={<Utensils className="w-6 h-6" />}
              gradient="from-orange-400 to-red-500"
              href="/map?category=Food"
              code="C2"
            />
            <TicketCard
              title="Coffee"
              icon={<Coffee className="w-6 h-6" />}
              gradient="from-amber-400 to-orange-500"
              href="/map?category=Coffee"
              code="C3"
            />
            <TicketCard
              title="Home Goods"
              icon={<Home className="w-6 h-6" />}
              gradient="from-green-400 to-teal-500"
              href="/map?category=Home+Goods"
              code="D1"
            />
            <TicketCard
              title="Museums"
              icon={<Layers className="w-6 h-6" />}
              gradient="from-indigo-400 to-purple-500"
              href="/map?category=Museum"
              code="D2"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
