import { motion } from 'framer-motion';
import { Youtube, Instagram, Mail, Heart } from 'lucide-react';

export function CompactFooter() {
  // Placeholder links - user will provide later
  const links = {
    youtube: '#',
    instagram: '#',
    about: '/about',
    contact: '#',
    support: '#'
  };

  return (
    <footer className="relative bg-gradient-to-b from-black via-gray-900 to-black border-t-2 border-cyan-400/20">
      {/* Film grain */}
      <div className="absolute inset-0 film-grain opacity-20" />

      {/* Subtle gradient glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left side - Branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <h3 className="text-2xl font-black text-white italic transform -skew-x-3 mb-2"
                style={{ textShadow: '0 0 20px rgba(34, 217, 238, 0.4)' }}>
              LOST IN TRANSIT
            </h3>
            <p className="text-sm text-gray-400">
              Your guide to Japan's hidden gems
            </p>
          </motion.div>

          {/* Center - Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm"
          >
            <a
              href={links.about}
              className="text-gray-400 hover:text-cyan-300 transition-colors duration-300 font-medium"
            >
              About
            </a>
            <a
              href={links.contact}
              className="text-gray-400 hover:text-cyan-300 transition-colors duration-300 font-medium"
            >
              Contact
            </a>
            <a
              href={links.support}
              className="flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition-colors duration-300 font-medium"
            >
              <Heart className="w-4 h-4" />
              Support
            </a>
          </motion.div>

          {/* Right side - Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <a
              href={links.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 hover:border-cyan-400/60 hover:scale-110 transition-all duration-300"
              style={{ boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' }}
              aria-label="YouTube"
            >
              <Youtube className="w-5 h-5" />
            </a>
            <a
              href={links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 hover:border-cyan-400/60 hover:scale-110 transition-all duration-300"
              style={{ boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' }}
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href={`mailto:${links.contact}`}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 hover:border-cyan-400/60 hover:scale-110 transition-all duration-300"
              style={{ boxShadow: '0 0 15px rgba(34, 217, 238, 0.2)' }}
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </motion.div>
        </div>

        {/* Bottom bar - Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 pt-8 border-t border-gray-800 text-center"
        >
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Lost In Transit. All rights reserved.
          </p>
        </motion.div>
      </div>

      {/* Corner decorations */}
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-400/30" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-400/30" />
    </footer>
  );
}
