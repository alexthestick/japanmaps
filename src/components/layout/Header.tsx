import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Menu, X, Heart, User, ShoppingBag, LogOut, Info, Store, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getSavedStoreCount } from '../../utils/savedStores';
import { MapStyleToggle } from '../map/MapStyleToggle';
import { useAuthContext } from '../../contexts/AuthContext';

interface HeaderProps {
  onCitiesClick?: () => void;
}

// ─── Avatar colors (deterministic from username) ──────────────────────────────
const AVATAR_COLORS = ['#22d9ee', '#a855f7', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];
function avatarColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ─── Profile dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ onClose }: { onClose: () => void }) {
  const { user, profile, signOut } = useAuthContext();
  const navigate = useNavigate();
  const username = profile?.username || profile?.display_name || user?.email?.split('@')[0] || '';
  const color = avatarColor(username);

  async function handleSignOut() {
    onClose();
    await signOut();
    navigate('/');
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-52 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50"
         style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
      {user && (
        <div className="px-4 py-3 border-b border-gray-800">
          <p className="text-white font-bold text-sm">@{username}</p>
          <p className="text-gray-500 text-xs truncate">{user.email}</p>
        </div>
      )}
      <div className="py-1">
        {user ? (
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <User className="h-4 w-4 text-gray-500" />
            My Profile
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <User className="h-4 w-4 text-gray-500" />
              Sign in
            </Link>
            <Link
              to="/signup"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-400 hover:text-purple-300 hover:bg-gray-800 transition-colors"
            >
              Create account
            </Link>
          </>
        )}
        <Link
          to="/suggest"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <Store className="h-4 w-4 text-gray-500" />
          Suggest a Store
        </Link>
        <Link
          to="/about"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <Info className="h-4 w-4 text-gray-500" />
          About
        </Link>
        {user && (
          <>
            <div className="h-px bg-gray-800 my-1" />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Avatar button ────────────────────────────────────────────────────────────
function ProfileButton() {
  const { user, profile } = useAuthContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const username = profile?.username || profile?.display_name || user?.email?.split('@')[0] || '';
  const color = avatarColor(username);
  const initials = username.slice(0, 2).toUpperCase();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg transition-all hover:bg-gray-800 p-1"
        title={user ? `@${username}` : 'Sign in'}
      >
        {user ? (
          <>
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black"
              style={{
                backgroundColor: `${color}25`,
                border: `1.5px solid ${color}50`,
                color,
                boxShadow: `0 0 8px ${color}20`,
              }}
            >
              {initials || <User className="h-3.5 w-3.5" />}
            </div>
            <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
          </>
        ) : (
          <>
            <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-gray-800 border border-gray-700">
              <User className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {open && <ProfileDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────
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
    setSavedCount(getSavedStoreCount());
    const handleChange = () => setSavedCount(getSavedStoreCount());
    window.addEventListener('savedStoresChanged', handleChange);
    return () => window.removeEventListener('savedStoresChanged', handleChange);
  }, []);

  useEffect(() => {
    try { localStorage.setItem('map-style-mode', styleMode); } catch {}
    window.dispatchEvent(new Event('mapStyleModeChanged'));
  }, [styleMode]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <header className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b-2 border-cyan-400/30 sticky top-0 z-40 overflow-visible pt-safe">
      {/* Film grain */}
      <div className="absolute inset-0 film-grain opacity-20 pointer-events-none" />

      {/* Corner decorations */}
      <div className="absolute top-2 left-4 w-3 h-3 border-t-2 border-l-2 border-cyan-400/40" />
      <div className="absolute top-2 right-4 w-3 h-3 border-t-2 border-r-2 border-purple-400/40" />

      <div className="w-full px-6 relative z-10">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-black italic text-white hover:scale-105 transition-transform flex-shrink-0">
            <MapPin className="w-6 h-6 text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px rgba(34, 217, 238, 0.6))' }} />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300">
              Lost in Transit
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">

            {/* Primary: explore links */}
            <Link to="/map?view=map"
              className="px-3 py-2 text-sm font-bold text-cyan-300 hover:text-white transition-all rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-400/30 italic"
              style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
              MAP
            </Link>
            <Link to="/map?view=list"
              className="px-3 py-2 text-sm font-bold text-cyan-300 hover:text-white transition-all rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-400/30 italic"
              style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
              LIST
            </Link>
            <Link to="/cities"
              className="px-3 py-2 text-sm font-bold text-cyan-300 hover:text-white transition-all rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-400/30 italic"
              style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
              CITIES
            </Link>
            <Link to="/neighborhoods"
              className="px-3 py-2 text-sm font-bold text-cyan-300 hover:text-white transition-all rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-400/30 italic"
              style={{ textShadow: '0 0 10px rgba(34, 217, 238, 0.3)' }}>
              NEIGHBORHOODS
            </Link>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-700 mx-1" />

            {/* Content links */}
            <Link to="/blog"
              className="px-3 py-2 text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-all rounded-lg hover:bg-yellow-500/10 border border-transparent hover:border-yellow-400/30 italic"
              style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.4)' }}>
              BLOG
            </Link>
            <Link to="/finds"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-purple-400 hover:text-purple-300 transition-all rounded-lg hover:bg-purple-500/10 border border-transparent hover:border-purple-400/30 italic"
              style={{ textShadow: '0 0 10px rgba(168, 85, 247, 0.4)' }}>
              <ShoppingBag className="h-3.5 w-3.5" />
              FINDS
            </Link>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-700 mx-1" />

            {/* Right side utilities */}
            <Link
              to="/saved"
              className="relative text-gray-400 hover:text-cyan-300 transition-all p-2 rounded-lg hover:bg-cyan-500/10"
              title="Saved stores"
            >
              <Heart className={`w-4 h-4 transition-all ${savedCount > 0 ? 'fill-cyan-400 text-cyan-400' : ''}`}
                style={{ filter: savedCount > 0 ? 'drop-shadow(0 0 6px rgba(34, 217, 238, 0.6))' : '' }} />
              {savedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-cyan-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {savedCount}
                </span>
              )}
            </Link>

            {/* Profile avatar + dropdown */}
            <ProfileButton />

            {/* Day/Night toggle */}
            <div className="ml-1">
              <MapStyleToggle mode={styleMode} onChange={setStyleMode} placement="inline" compact />
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-cyan-400/20">
            <nav className="flex flex-col gap-1">
              {[
                { to: '/map?view=map', label: 'MAP', color: 'cyan' },
                { to: '/map?view=list', label: 'LIST', color: 'cyan' },
                { to: '/cities', label: 'CITIES', color: 'cyan' },
                { to: '/neighborhoods', label: 'NEIGHBORHOODS', color: 'cyan' },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-cyan-300 hover:text-white font-bold transition-colors px-3 py-2 rounded-lg hover:bg-cyan-500/10 italic text-sm"
                >
                  {item.label}
                </Link>
              ))}

              <div className="h-px bg-gray-800 my-2" />

              <Link to="/blog" onClick={() => setMobileMenuOpen(false)}
                className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors px-3 py-2 rounded-lg hover:bg-yellow-500/10 italic text-sm">
                BLOG
              </Link>
              <Link to="/finds" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold transition-colors px-3 py-2 rounded-lg hover:bg-purple-500/10 italic text-sm">
                <ShoppingBag className="h-4 w-4" />
                FINDS
              </Link>

              <div className="h-px bg-gray-800 my-2" />

              <Link to="/saved" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-cyan-300 transition-colors px-3 py-2 text-sm">
                <Heart className={`w-4 h-4 ${savedCount > 0 ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                Saved Stores {savedCount > 0 && `(${savedCount})`}
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-3 py-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                Profile
              </Link>
              <Link to="/suggest" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-3 py-2 text-sm">
                <Store className="h-4 w-4 text-gray-500" />
                Suggest a Store
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors px-3 py-2 text-sm">
                <Info className="h-4 w-4 text-gray-500" />
                About
              </Link>

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
