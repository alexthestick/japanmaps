import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, ShoppingBag, Camera, X, ChevronDown, Plus,
  Upload, Search, Filter,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FieldNote {
  id: string;
  type: 'visit' | 'haul';
  photo_url: string | null;
  store_name: string;
  store_id: string | null;
  neighborhood: string | null;
  city: string;
  item_name: string | null;
  caption: string | null;
  created_at: string;
  profiles: {
    username: string | null;
    display_name: string | null;
  } | null;
}

// ─── Note card ─────────────────────────────────────────────────────────────────

function NoteCard({ note }: { note: FieldNote }) {
  const isVisit = note.type === 'visit';
  const typeColor = isVisit ? '#22d9ee' : '#a855f7';
  const TypeIcon = isVisit ? MapPin : ShoppingBag;
  const typeLabel = isVisit ? 'VISITED' : 'PICKED UP';

  const username = note.profiles?.username || note.profiles?.display_name || 'Anonymous';
  const initials = username.slice(0, 2).toUpperCase();

  const timeAgo = (dateStr: string): string => {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative break-inside-avoid mb-4 rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-opacity-80 transition-all duration-300 cursor-pointer"
      style={{ borderColor: `${typeColor}20` }}
      whileHover={{ y: -4 }}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        style={{ boxShadow: `inset 0 0 30px ${typeColor}15` }}
      />

      {/* Photo */}
      {note.photo_url && (
        <div className="relative w-full overflow-hidden" style={{ paddingBottom: '125%' }}>
          <img
            src={note.photo_url}
            alt={note.store_name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Type badge */}
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-sm"
            style={{ backgroundColor: `${typeColor}20`, border: `1px solid ${typeColor}60`, color: typeColor }}
          >
            <TypeIcon className="h-3 w-3" />
            {typeLabel}
          </div>

          {/* Bottom content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black"
                style={{ backgroundColor: `${typeColor}30`, color: typeColor }}
              >
                {initials}
              </div>
              <span className="text-white/70 text-xs font-medium">@{username}</span>
              <span className="text-white/30 text-xs ml-auto">{timeAgo(note.created_at)}</span>
            </div>
            <p className="text-white font-bold text-sm leading-tight">{note.store_name}</p>
            {(note.neighborhood || note.city) && (
              <p className="text-white/50 text-xs mt-0.5">{note.neighborhood || note.city}</p>
            )}
            {note.item_name && (
              <p
                className="text-xs mt-1.5 font-medium truncate px-2 py-1 rounded-full"
                style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
              >
                {note.item_name}
              </p>
            )}
            {note.caption && (
              <p className="text-white/60 text-xs mt-2 line-clamp-2 leading-relaxed">{note.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* No-photo layout */}
      {!note.photo_url && (
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
            <span className="text-gray-600 text-xs ml-auto">{timeAgo(note.created_at)}</span>
          </div>
          <p className="text-white font-bold">{note.store_name}</p>
          {(note.neighborhood || note.city) && (
            <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {note.neighborhood || note.city}
            </p>
          )}
          {note.caption && (
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">{note.caption}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Submit modal ──────────────────────────────────────────────────────────────

interface SubmitModalProps {
  onClose: () => void;
  onSubmitted: () => void;
}

function SubmitModal({ onClose, onSubmitted }: SubmitModalProps) {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [type, setType] = useState<'visit' | 'haul'>('visit');
  const [storeName, setStoreName] = useState('');
  const [storeSearch, setStoreSearch] = useState('');
  const [storeResults, setStoreResults] = useState<{ id: string; name: string; city: string; neighborhood: string | null }[]>([]);
  const [selectedStore, setSelectedStore] = useState<{ id: string; name: string; city: string; neighborhood: string | null } | null>(null);
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [itemName, setItemName] = useState('');
  const [caption, setCaption] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Search stores as user types
  useEffect(() => {
    if (storeSearch.length < 2) { setStoreResults([]); return; }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('stores')
        .select('id, name, city, neighborhood')
        .ilike('name', `%${storeSearch}%`)
        .limit(6);
      setStoreResults(data || []);
    }, 300);
    return () => clearTimeout(timer);
  }, [storeSearch]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function selectStore(store: typeof storeResults[0]) {
    setSelectedStore(store);
    setStoreName(store.name);
    setCity(store.city);
    setNeighborhood(store.neighborhood || '');
    setStoreSearch('');
    setStoreResults([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!storeName.trim() || !city.trim()) {
      setError('Store name and city are required.');
      return;
    }
    if (type === 'haul' && !itemName.trim()) {
      setError('Item name is required for haul posts.');
      return;
    }

    setSubmitting(true);
    setError('');

    let photo_url: string | null = null;

    // Upload photo if provided
    if (photoFile) {
      const ext = photoFile.name.split('.').pop();
      const path = `field-notes/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('field-notes')
        .upload(path, photoFile, { contentType: photoFile.type });

      if (uploadError) {
        setError('Photo upload failed. Please try again.');
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('field-notes').getPublicUrl(path);
      photo_url = urlData.publicUrl;
    }

    const { error: insertError } = await supabase.from('field_notes').insert({
      user_id: user.id,
      type,
      store_name: storeName.trim(),
      store_id: selectedStore?.id || null,
      city: city.trim(),
      neighborhood: neighborhood.trim() || null,
      item_name: type === 'haul' ? itemName.trim() : null,
      caption: caption.trim() || null,
      photo_url,
      status: 'pending',
    });

    if (insertError) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    onSubmitted();
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Submit a Field Note</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Type toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
            <div className="flex gap-2">
              {([
                { id: 'visit' as const, label: 'Visited', icon: MapPin, color: '#22d9ee' },
                { id: 'haul' as const, label: 'Picked up', icon: ShoppingBag, color: '#a855f7' },
              ]).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: type === opt.id ? `${opt.color}20` : 'rgb(17,24,39)',
                    border: `1px solid ${type === opt.id ? `${opt.color}60` : 'rgb(31,41,55)'}`,
                    color: type === opt.id ? opt.color : 'rgb(156,163,175)',
                  }}
                >
                  <opt.icon className="h-4 w-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Store search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-400 mb-2">Store</label>
            {selectedStore ? (
              <div className="flex items-center gap-2 p-3 bg-gray-900 border border-gray-700 rounded-xl">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{selectedStore.name}</p>
                  <p className="text-gray-500 text-xs">{selectedStore.neighborhood || selectedStore.city}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedStore(null); setStoreName(''); setCity(''); setNeighborhood(''); }}
                  className="text-gray-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    value={storeSearch}
                    onChange={e => setStoreSearch(e.target.value)}
                    placeholder="Search for a store..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                {storeResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
                    {storeResults.map(store => (
                      <button
                        key={store.id}
                        type="button"
                        onClick={() => selectStore(store)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-800 transition-colors"
                      >
                        <p className="text-white text-sm">{store.name}</p>
                        <p className="text-gray-500 text-xs">{store.neighborhood || store.city}</p>
                      </button>
                    ))}
                  </div>
                )}
                {/* Manual entry fallback */}
                {storeSearch && storeResults.length === 0 && (
                  <button
                    type="button"
                    onClick={() => { setStoreName(storeSearch); setStoreSearch(''); }}
                    className="w-full mt-1 text-left px-4 py-2.5 bg-gray-900 border border-dashed border-gray-700 rounded-xl text-gray-400 text-sm hover:border-gray-500 transition-colors"
                  >
                    + Add "{storeSearch}" as new store
                  </button>
                )}
                {storeName && !selectedStore && (
                  <p className="text-gray-500 text-xs mt-1">Using: <span className="text-white">{storeName}</span></p>
                )}
              </>
            )}
          </div>

          {/* City + Neighborhood */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">City *</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                required
                placeholder="Tokyo"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Neighborhood</label>
              <input
                type="text"
                value={neighborhood}
                onChange={e => setNeighborhood(e.target.value)}
                placeholder="Shimokitazawa"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Item name (haul only) */}
          {type === 'haul' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Item picked up *</label>
              <input
                type="text"
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                placeholder="e.g. Issey Miyake Pleats Please jacket"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          )}

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Caption <span className="text-gray-600">(optional)</span></label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              maxLength={280}
              rows={2}
              placeholder="Share what made this place special..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none transition-colors"
            />
            <p className="text-gray-600 text-xs mt-1 text-right">{caption.length}/280</p>
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Photo <span className="text-gray-600">(optional{type === 'haul' ? ', recommended' : ''})</span>
            </label>
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="" className="w-full h-48 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-700 hover:border-gray-500 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-300 transition-all"
              >
                <Upload className="h-6 w-6" />
                <span className="text-sm">Click to upload photo</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            style={{
              background: type === 'visit'
                ? 'linear-gradient(135deg, #22d9ee40, #22d9ee20)'
                : 'linear-gradient(135deg, #a855f740, #a855f720)',
              border: `1px solid ${type === 'visit' ? '#22d9ee50' : '#a855f750'}`,
              color: type === 'visit' ? '#22d9ee' : '#a855f7',
            }}
          >
            {submitting ? (
              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Submit Field Note
              </>
            )}
          </button>

          <p className="text-center text-gray-600 text-xs">
            Field notes are reviewed before appearing publicly.
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const CITIES = ['All Cities', 'Tokyo', 'Osaka', 'Kyoto', 'Fukuoka', 'Nagoya', 'Sapporo'];

export function FieldNotesPage() {
  const { user } = useAuthContext();
  const [notes, setNotes] = useState<FieldNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'visit' | 'haul'>('all');
  const [filterCity, setFilterCity] = useState('All Cities');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 24;

  async function fetchNotes(reset = false) {
    const start = reset ? 0 : page * PAGE_SIZE;
    setLoading(true);

    let query = supabase
      .from('field_notes')
      .select('*, profiles(username, display_name)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(start, start + PAGE_SIZE - 1);

    if (filterType !== 'all') query = query.eq('type', filterType);
    if (filterCity !== 'All Cities') query = query.eq('city', filterCity);

    const { data } = await query;
    const fetched = (data as FieldNote[]) || [];

    setNotes(prev => reset ? fetched : [...prev, ...fetched]);
    setHasMore(fetched.length === PAGE_SIZE);
    if (!reset) setPage(p => p + 1);
    setLoading(false);
  }

  useEffect(() => {
    setPage(0);
    fetchNotes(true);
  }, [filterType, filterCity]);

  function handleSubmitted() {
    // No immediate reload needed as note is pending review
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/4 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Link to="/" className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-400 text-sm mb-6 transition-colors">
            <MapPin className="h-3.5 w-3.5" />
            Lost in Transit
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1
                className="font-display text-5xl sm:text-6xl font-black text-white italic"
                style={{ textShadow: '0 0 30px rgba(168,85,247,0.4)' }}
              >
                FIELD NOTES
              </h1>
              <p className="mt-2 text-gray-400 text-lg">
                Real visits & finds from the community
              </p>
            </div>

            {/* Submit CTA */}
            <button
              onClick={() => {
                if (!user) { window.location.href = '/login'; return; }
                setShowSubmitModal(true);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.1))',
                border: '1px solid rgba(168,85,247,0.4)',
                color: '#a855f7',
                boxShadow: '0 0 20px rgba(168,85,247,0.15)',
              }}
            >
              <Plus className="h-4 w-4" />
              Submit
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mt-8">
            {/* Type filter */}
            <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-800">
              {([
                { id: 'all' as const, label: 'All' },
                { id: 'visit' as const, label: 'Visits', icon: MapPin, color: '#22d9ee' },
                { id: 'haul' as const, label: 'Hauls', icon: ShoppingBag, color: '#a855f7' },
              ]).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilterType(opt.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterType === opt.id ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {opt.icon && <opt.icon className="h-3.5 w-3.5" style={{ color: filterType === opt.id ? opt.color : undefined }} />}
                  {opt.label}
                </button>
              ))}
            </div>

            {/* City filter */}
            <div className="relative">
              <select
                value={filterCity}
                onChange={e => setFilterCity(e.target.value)}
                className="appearance-none bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 pr-8 text-sm text-gray-300 focus:outline-none focus:border-gray-600 cursor-pointer"
              >
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Masonry grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading && notes.length === 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid mb-4 rounded-xl bg-gray-900 animate-pulse"
                style={{ height: `${200 + (i % 3) * 80}px` }}
              />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-24">
            <Camera className="h-12 w-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-lg">No field notes yet</p>
            <p className="text-gray-600 text-sm mt-2">
              {filterType !== 'all' || filterCity !== 'All Cities'
                ? 'Try adjusting your filters'
                : 'Be the first to share a visit or haul'}
            </p>
            {user && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                Submit the first one
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {notes.map(note => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => fetchNotes()}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Submit modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <SubmitModal
            onClose={() => setShowSubmitModal(false)}
            onSubmitted={handleSubmitted}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
