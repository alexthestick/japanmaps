import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Camera, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { generateFindSlug, getDisplayUsername } from '../../utils/slugify';
import { SubmitModal } from '../../pages/FindsPage';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface StoreFind {
  id: string;
  user_id: string;
  type: 'visit' | 'haul';
  photo_url: string | null;
  store_name: string;
  item_name: string | null;
  caption: string | null;
  created_at: string;
  profiles: { username: string | null; display_name: string | null } | null;
}

// ─── Find Card ─────────────────────────────────────────────────────────────────

function StoreFindCard({ find }: { find: StoreFind }) {
  const isVisit = find.type === 'visit';
  const typeColor = isVisit ? '#22d9ee' : '#a855f7';
  const TypeIcon = isVisit ? Eye : ShoppingBag;
  const typeLabel = isVisit ? 'VISITED' : 'PICKED UP';
  const navigate = useNavigate();

  const username = getDisplayUsername(find.profiles, find.user_id);
  const initials = username.slice(0, 2).toUpperCase();

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative break-inside-avoid mb-4 rounded-xl overflow-hidden bg-gray-900/60 border cursor-pointer transition-all duration-300"
      style={{ borderColor: `${typeColor}20` }}
      whileHover={{ y: -3, boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${typeColor}30` }}
      onClick={() => navigate(`/finds/${generateFindSlug(find)}`)}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        style={{ boxShadow: `inset 0 0 30px ${typeColor}10` }}
      />

      {find.photo_url ? (
        /* Photo layout */
        <div>
          <div className="relative w-full overflow-hidden" style={{ paddingBottom: '100%' }}>
            <img
              src={find.photo_url}
              alt={find.store_name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            {/* Type badge */}
            <div
              className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{ backgroundColor: `${typeColor}25`, border: `1px solid ${typeColor}60`, color: typeColor }}
            >
              <TypeIcon className="h-3 w-3" />
              {typeLabel}
            </div>
            {/* User + time */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                  style={{ backgroundColor: `${typeColor}30`, color: typeColor }}
                >
                  {initials}
                </div>
                <span className="text-white/70 text-xs">@{username}</span>
                <span className="text-white/30 text-xs ml-auto">{timeAgo(find.created_at)}</span>
              </div>
              {find.item_name && (
                <p
                  className="text-xs font-medium truncate px-2 py-0.5 rounded-full w-fit"
                  style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
                >
                  {find.item_name}
                </p>
              )}
              {find.caption && (
                <p className="text-white/60 text-xs mt-1.5 line-clamp-2 leading-relaxed">{find.caption}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Text-only layout */
        <div className="p-4">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider w-fit mb-3"
            style={{ backgroundColor: `${typeColor}20`, border: `1px solid ${typeColor}60`, color: typeColor }}
          >
            <TypeIcon className="h-3 w-3" />
            {typeLabel}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-black"
              style={{ backgroundColor: `${typeColor}30`, color: typeColor }}
            >
              {initials}
            </div>
            <span className="text-gray-400 text-xs">@{username}</span>
            <span className="text-gray-600 text-xs ml-auto">{timeAgo(find.created_at)}</span>
          </div>
          {find.item_name && (
            <p
              className="text-xs font-medium truncate px-2 py-1 rounded-full w-fit mb-2"
              style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
            >
              {find.item_name}
            </p>
          )}
          {find.caption && (
            <p className="text-gray-400 text-sm leading-relaxed">{find.caption}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Section Component ────────────────────────────────────────────────────

interface StoreFindsSectionProps {
  storeId: string;
  storeName: string;
  storeCity: string;
  storeNeighborhood?: string;
}

export function StoreFindsSection({ storeId, storeName, storeCity, storeNeighborhood }: StoreFindsSectionProps) {
  const [finds, setFinds] = useState<StoreFind[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'visit' | 'haul'>('haul');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitType, setSubmitType] = useState<'visit' | 'haul'>('visit');
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    supabase
      .from('field_notes')
      .select('id, user_id, type, photo_url, store_name, item_name, caption, created_at, profiles(username, display_name)')
      .eq('store_id', storeId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setFinds((data as StoreFind[]) || []);
        setLoading(false);
      });
  }, [storeId]);

  const visits = finds.filter(f => f.type === 'visit');
  const hauls = finds.filter(f => f.type === 'haul');
  const displayed = activeTab === 'visit' ? visits : hauls;

  function openSubmitModal(type: 'visit' | 'haul') {
    setSubmitType(type);
    setShowSubmitModal(true);
  }

  return (
    <>
      <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-white/5 overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2
              className="text-2xl font-black italic uppercase"
              style={{ color: '#22D9EE', textShadow: '0 0 20px rgba(34,217,238,0.3)' }}
            >
              FROM THE COMMUNITY
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">Visits & hauls logged by travelers</p>
          </div>
          <button
            onClick={() => openSubmitModal('haul')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,217,238,0.1))',
              border: '1px solid rgba(168,85,247,0.4)',
              color: '#a855f7',
              boxShadow: '0 0 20px rgba(168,85,247,0.15)',
            }}
          >
            <Camera className="w-4 h-4" />
            Log a Find
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-6 mb-4">
          {([
            { key: 'haul' as const, label: 'HAULS', count: hauls.length, color: '#a855f7' },
            { key: 'visit' as const, label: 'VISITS', count: visits.length, color: '#22d9ee' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all"
              style={{
                backgroundColor: activeTab === tab.key ? `${tab.color}20` : 'transparent',
                border: `1px solid ${activeTab === tab.key ? `${tab.color}50` : 'rgba(255,255,255,0.06)'}`,
                color: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.3)',
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-black"
                  style={{ backgroundColor: `${tab.color}30`, color: tab.color }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-600 text-sm">
              <span className="animate-spin h-5 w-5 border-2 border-gray-700 border-t-cyan-500 rounded-full mr-3" />
              Loading finds...
            </div>
          ) : displayed.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: activeTab === 'visit' ? 'rgba(34,217,238,0.1)' : 'rgba(168,85,247,0.1)' }}
              >
                {activeTab === 'visit'
                  ? <Eye className="w-5 h-5 text-cyan-500/60" />
                  : <ShoppingBag className="w-5 h-5 text-purple-500/60" />
                }
              </div>
              <p className="text-gray-500 text-sm mb-1">
                No {activeTab === 'visit' ? 'visits' : 'hauls'} logged yet
              </p>
              <p className="text-gray-700 text-xs mb-4">Be the first to log a {activeTab} at this store</p>
              <button
                onClick={() => openSubmitModal(activeTab)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  backgroundColor: activeTab === 'visit' ? 'rgba(34,217,238,0.1)' : 'rgba(168,85,247,0.1)',
                  border: `1px solid ${activeTab === 'visit' ? 'rgba(34,217,238,0.3)' : 'rgba(168,85,247,0.3)'}`,
                  color: activeTab === 'visit' ? '#22d9ee' : '#a855f7',
                }}
              >
                <Camera className="w-3.5 h-3.5" />
                Log a {activeTab === 'visit' ? 'visit' : 'haul'}
              </button>
            </div>
          ) : (
            /* Masonry grid */
            <div className="columns-2 md:columns-3 gap-4">
              {displayed.map(find => (
                <StoreFindCard key={find.id} find={find} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <SubmitModal
            onClose={() => setShowSubmitModal(false)}
            onSubmitted={() => {
              setShowSubmitModal(false);
              setShowBanner(true);
              setTimeout(() => setShowBanner(false), 5000);
            }}
            prefill={{
              storeId,
              storeName,
              storeCity,
              storeNeighborhood,
              defaultType: submitType,
            }}
          />
        )}
      </AnimatePresence>

      {/* Submitted banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 bg-gray-900 border border-purple-500/40 rounded-2xl shadow-2xl text-sm text-white"
          >
            <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            Your find has been submitted for review. Thanks!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
