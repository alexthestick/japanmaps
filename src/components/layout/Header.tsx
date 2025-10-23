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

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left aligned */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span>Lost in Transit</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/map?view=map" className="text-gray-700 hover:text-gray-900 transition-colors">
              Map
            </Link>
            <Link to="/map?view=list" className="text-gray-700 hover:text-gray-900 transition-colors">
              List
            </Link>
            <Link to="/cities" className="text-gray-700 hover:text-gray-900 transition-colors">
              Cities
            </Link>
            <Link to="/neighborhoods" className="text-gray-700 hover:text-gray-900 transition-colors">
              Neighborhoods
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-gray-900 transition-colors">
              Blog
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-gray-900 transition-colors">
              About
            </Link>

            {/* Saved Stores */}
            <Link
              to="/saved"
              className="relative text-gray-700 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-red-50"
              title="View saved stores"
            >
              <Heart className={`w-5 h-5 transition-all ${savedCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {savedCount}
                </span>
              )}
            </Link>

            <Link to="/suggest">
              <Button size="sm">Suggest a Store</Button>
            </Link>

            {/* Day/Night toggle in header */}
            <div className="ml-2">
              <MapStyleToggle mode={styleMode} onChange={setStyleMode} placement="inline" compact />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              <Link
                to="/map"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Map
              </Link>
              <Link
                to="/cities"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cities
              </Link>
              <Link
                to="/neighborhoods"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Neighborhoods
              </Link>
              <Link
                to="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Blog
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                About
              </Link>
              <Link
                to="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Heart className="w-5 h-5" />
                Saved Stores {savedCount > 0 && `(${savedCount})`}
              </Link>
              <Link to="/suggest" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">Suggest a Store</Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}


