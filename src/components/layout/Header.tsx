import { Link } from 'react-router-dom';
import { MapPin, Menu, X, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { getSavedStoreCount } from '../../utils/savedStores';
import { MapStyleToggle } from '../map/MapStyleToggle';

interface HeaderProps {
  onCitiesClick?: () => void;
}

export function Header({ onCitiesClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [styleMode, setStyleMode] = useState<'day' | 'night'>(() => {
    try {
      const saved = localStorage.getItem('map-style-mode');
      if (saved === 'day' || saved === 'night') return saved as 'day' | 'night';
      const hour = new Date().getHours();
      return hour >= 18 || hour < 6 ? 'night' : 'day';
    } catch { return 'day'; }
  });

  useEffect(() => {
    // Initial count
    setSavedCount(getSavedStoreCount());

    // Listen for changes
    const handleSavedStoresChanged = () => {
      setSavedCount(getSavedStoreCount());
    };

    window.addEventListener('savedStoresChanged', handleSavedStoresChanged);
    return () => window.removeEventListener('savedStoresChanged', handleSavedStoresChanged);
  }, []);

  useEffect(() => {
    try { localStorage.setItem('map-style-mode', styleMode); } catch {}
    window.dispatchEvent(new Event('mapStyleModeChanged'));
  }, [styleMode]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b-2 border-cyan-400/30 sticky top-0 z-40 overflow-hidden">
      {/* Film grain */}
      <div className="absolute inset-0 film-grain opacity-20 pointer-events-none" />

      {/* Corner decorations */}
      <div className="absolute top-2 left-4 w-3 h-3 border-t-2 border-l-2 border-cyan-400/40" />
      <div className="absolute top-2 right-4 w-3 h-3 border-t-2 border-r-2 border-purple-400/40" />

      <div className="w-full px-6 relative z-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left aligned with Kirby style */}
          <Link to="/" className="flex items-center gap-2 text-xl font-black italic text-white hover:scale-105 transition-transform">
            <MapPin className="w-6 h-6 text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px rgba(34, 217, 238, 0.6))' }} />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300" style={{ textShadow: '0 0 20px rgba(34, 217, 238, 0.3)' }}>
              Lost in Transit
            </span>
          </Link>

          {/* Desktop Navigation - Kirby themed */}
          <nav className="hidden md:flex items-center gap-3">
            {/* Primary Navigation (Map, List, Cities, Neighborhoods) - More prominent */}
            <Link
              to="/map?view=map"
              className="px-4 py-2 text-base font-bold text-cyan-300 hover:text-white transition-all rounded-lg hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 border border-transparent hover:border-cyan-400/50 italic"
              style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}
            >
              MAP
            </Link>
            <Link
              to="/map?view=list"
              className="px-4 py-2 text-base font-bold text-cyan-300 hover:text-white transition-all rounded-lg hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 border border-transparent hover:border-cyan-400/50 italic"
              style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}
            >
              LIST
            </Link>
            <Link
              to="/cities"
              className="px-4 py-2 text-base font-bold text-cyan-300 hover:text-white transition-all rounded-lg hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 border border-transparent hover:border-cyan-400/50 italic"
              style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}
            >
              CITIES
            </Link>
            <Link
              to="/neighborhoods"
              className="px-4 py-2 text-base font-bold text-cyan-300 hover:text-white transition-all rounded-lg hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 border border-transparent hover:border-cyan-400/50 italic"
              style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}
            >
              NEIGHBORHOODS
            </Link>

            {/* Divider */}
            <div className="w-px h-6 bg-cyan-400/30 mx-1" />

            {/* Secondary Navigation */}
            <Link to="/blog" className="px-4 py-2 text-base font-bold text-yellow-400 hover:text-yellow-300 transition-all rounded-lg hover:bg-yellow-500/20 border border-transparent hover:border-yellow-400/50 italic" style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.4)' }}>
              BLOG
            </Link>
            <Link to="/about" className="px-3 py-1 text-sm font-medium text-gray-400 hover:text-cyan-300 transition-colors">
              About
            </Link>

            {/* Saved Stores - Kirby themed */}
            <Link
              to="/saved"
              className="relative text-cyan-400 hover:text-cyan-300 transition-all p-2 rounded-lg hover:bg-cyan-500/10"
              title="View saved stores"
            >
              <Heart className={`w-5 h-5 transition-all ${savedCount > 0 ? 'fill-cyan-400 text-cyan-400' : ''}`} style={{ filter: savedCount > 0 ? 'drop-shadow(0 0 6px rgba(34, 217, 238, 0.6))' : '' }} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg border border-cyan-300/50"
                      style={{ boxShadow: '0 0 10px rgba(34, 217, 238, 0.5)' }}>
                  {savedCount}
                </span>
              )}
            </Link>

            {/* Suggest Store button - Kirby gradient */}
            <Link to="/suggest">
              <button className="relative px-4 py-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white text-sm font-bold rounded-lg hover:scale-105 transition-all border-2 border-cyan-300/50 overflow-hidden">
                <div className="absolute inset-0 film-grain opacity-10" />
                <span className="relative z-10">SUGGEST STORE</span>
              </button>
            </Link>

            {/* Day/Night toggle in header */}
            <div className="ml-2">
              <MapStyleToggle mode={styleMode} onChange={setStyleMode} placement="inline" compact />
            </div>
          </nav>

          {/* Mobile Menu Button - Kirby themed */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation - Kirby themed */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-cyan-400/20">
            <nav className="flex flex-col gap-3">
              <Link
                to="/map?view=map"
                onClick={() => setMobileMenuOpen(false)}
                className="text-cyan-300 hover:text-white font-bold transition-colors px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 italic"
              >
                MAP
              </Link>
              <Link
                to="/map?view=list"
                onClick={() => setMobileMenuOpen(false)}
                className="text-cyan-300 hover:text-white font-bold transition-colors px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 italic"
              >
                LIST
              </Link>
              <Link
                to="/cities"
                onClick={() => setMobileMenuOpen(false)}
                className="text-cyan-300 hover:text-white font-bold transition-colors px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 italic"
              >
                CITIES
              </Link>
              <Link
                to="/neighborhoods"
                onClick={() => setMobileMenuOpen(false)}
                className="text-cyan-300 hover:text-white font-bold transition-colors px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 italic"
              >
                NEIGHBORHOODS
              </Link>

              <div className="h-px bg-cyan-400/30 my-1" />

              <Link
                to="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors px-3 py-2 rounded-lg hover:bg-yellow-500/20 italic"
              >
                BLOG
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-400 hover:text-cyan-300 transition-colors px-3 py-1"
              >
                About
              </Link>
              <Link
                to="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors px-3 py-1"
              >
                <Heart className="w-5 h-5" />
                Saved Stores {savedCount > 0 && `(${savedCount})`}
              </Link>
              <Link to="/suggest" onClick={() => setMobileMenuOpen(false)}>
                <button className="relative w-full px-4 py-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white text-sm font-bold rounded-lg border-2 border-cyan-300/50 overflow-hidden">
                  <div className="absolute inset-0 film-grain opacity-10" />
                  <span className="relative z-10">SUGGEST STORE</span>
                </button>
              </Link>

              {/* Day/Night toggle for mobile */}
              <div className="mt-3 px-3">
                <MapStyleToggle mode={styleMode} onChange={setStyleMode} placement="inline" />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}


