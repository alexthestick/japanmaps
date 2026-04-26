import { useState, useEffect, useRef, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, ShoppingBag, Camera, X, ChevronDown, Plus,
  Search, ArrowRight, ArrowLeft, Check,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { generateFindSlug, getDisplayUsername } from '../utils/slugify';
import { ikUrl } from '../utils/ikUrl';
import { uploadStorePhoto } from '../utils/imagekitUpload';
import { MAJOR_CITIES_JAPAN, LOCATIONS } from '../lib/constants';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Find {
  id: string;
  user_id: string;
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

// ─── Find card ─────────────────────────────────────────────────────────────────

const FindCard = memo(function FindCard({ find }: { find: Find }) {
  const isVisit = find.type === 'visit';
  const typeColor = isVisit ? '#22d9ee' : '#a855f7';
  const TypeIcon = isVisit ? MapPin : ShoppingBag;
  const typeLabel = isVisit ? 'VISITED' : 'PICKED UP';
  const navigate = useNavigate();

  const username = getDisplayUsername(find.profiles, find.user_id);
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
      onClick={() => navigate(`/finds/${generateFindSlug(find)}`)}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        style={{ boxShadow: `inset 0 0 30px ${typeColor}15` }}
      />

      {/* Photo */}
      {find.photo_url && (
        <div className="relative w-full overflow-hidden" style={{ paddingBottom: '125%' }}>
          <img
            src={ikUrl(find.photo_url, 'thumb')}
            alt={find.store_name}
            loading="lazy"
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
              <span className="text-white/30 text-xs ml-auto">{timeAgo(find.created_at)}</span>
            </div>
            <p className="text-white font-bold text-sm leading-tight">{find.store_name}</p>
            {(find.neighborhood || find.city) && (
              <p className="text-white/50 text-xs mt-0.5">{find.neighborhood || find.city}</p>
            )}
            {find.item_name && (
              <p
                className="text-xs mt-1.5 font-medium truncate px-2 py-1 rounded-full"
                style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
              >
                {find.item_name}
              </p>
            )}
            {find.caption && (
              <p className="text-white/60 text-xs mt-2 line-clamp-2 leading-relaxed">{find.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* No-photo layout */}
      {!find.photo_url && (
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
          <p className="text-white font-bold">{find.store_name}</p>
          {(find.neighborhood || find.city) && (
            <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {find.neighborhood || find.city}
            </p>
          )}
          {find.caption && (
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">{find.caption}</p>
          )}
        </div>
      )}
    </motion.div>
  );
});

// ─── Submit modal ──────────────────────────────────────────────────────────────

export interface SubmitModalPrefill {
  storeId?: string;
  storeName?: string;
  storeCity?: string;
  storeNeighborhood?: string;
  defaultType?: 'visit' | 'haul';
}

interface SubmitModalProps {
  onClose: () => void;
  onSubmitted: () => void;
  prefill?: SubmitModalPrefill;
}

export function SubmitModal({ onClose, onSubmitted, prefill }: SubmitModalProps) {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // ── Step management ───────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2>(1);

  // ── Step 1 fields ─────────────────────────────────────────────────────────────
  const [type, setType] = useState<'visit' | 'haul'>(prefill?.defaultType || 'visit');
  const [storeSearch, setStoreSearch] = useState('');
  const [storeResults, setStoreResults] = useState<{ id: string; name: string; city: string; neighborhood: string | null; photos?: string[] }[]>([]);
  const [selectedStore, setSelectedStore] = useState<{ id: string; name: string; city: string; neighborhood: string | null; photos?: string[] } | null>(
    prefill?.storeId && prefill?.storeName
      ? { id: prefill.storeId, name: prefill.storeName, city: prefill.storeCity || '', neighborhood: prefill.storeNeighborhood || null }
      : null
  );
  const [storeName, setStoreName] = useState(prefill?.storeName || '');
  const [city, setCity] = useState(prefill?.storeCity || '');
  const [neighborhood, setNeighborhood] = useState(prefill?.storeNeighborhood || '');
  const [cityOpen, setCityOpen] = useState(false);
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);
  const [neighborhoodSearch, setNeighborhoodSearch] = useState('');
  const [step1Error, setStep1Error] = useState('');

  // ── Step 2 fields ─────────────────────────────────────────────────────────────
  const [itemName, setItemName] = useState('');
  const [caption, setCaption] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);

  const typeColor = type === 'visit' ? '#22d9ee' : '#a855f7';
  // Store photo for banner (first photo if available)
  const storePhoto = selectedStore?.photos?.[0] ?? null;

  // ── Neighborhood options for selected city ────────────────────────────────────
  const neighborhoodOptions: string[] = city in LOCATIONS
    ? (LOCATIONS as unknown as Record<string, string[]>)[city]
    : [];
  const filteredNeighborhoods = neighborhoodSearch
    ? neighborhoodOptions.filter(n => n.toLowerCase().includes(neighborhoodSearch.toLowerCase()))
    : neighborhoodOptions;

  // ── Store search debounce ─────────────────────────────────────────────────────
  useEffect(() => {
    if (storeSearch.length < 2) { setStoreResults([]); return; }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('stores')
        .select('id, name, city, neighborhood, photos')
        .ilike('name', `%${storeSearch}%`)
        .limit(6);
      setStoreResults(data || []);
    }, 300);
    return () => clearTimeout(timer);
  }, [storeSearch]);

  // ── Auto-resize caption textarea ─────────────────────────────────────────────
  useEffect(() => {
    const el = captionRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [caption]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function selectStore(store: typeof storeResults[0]) {
    setSelectedStore({ ...store, photos: store.photos ?? [] });
    setStoreName(store.name);
    setCity(store.city);
    setNeighborhood(store.neighborhood || '');
    setStoreSearch('');
    setStoreResults([]);
  }

  function clearStore() {
    setSelectedStore(null);
    setStoreName('');
    setCity('');
    setNeighborhood('');
  }

  function handleCitySelect(c: string) {
    setCity(c);
    setNeighborhood('');
    setNeighborhoodSearch('');
    setCityOpen(false);
  }

  function handleNeighborhoodSelect(n: string) {
    setNeighborhood(n);
    setNeighborhoodSearch('');
    setNeighborhoodOpen(false);
  }

  function handleStep1Next() {
    if (!storeName.trim()) {
      setStep1Error('Please select or enter a store name.');
      return;
    }
    if (!city.trim()) {
      setStep1Error('Please select a city.');
      return;
    }
    setStep1Error('');
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (type === 'haul' && !itemName.trim()) {
      setError('Item name is required for pickup posts.');
      return;
    }

    setSubmitting(true);
    setError('');

    let photo_url: string | null = null;

    if (photoFile) {
      try {
        const result = await uploadStorePhoto(photoFile);
        photo_url = result.url;
      } catch (uploadError) {
        setError('Photo upload failed. Please try again.');
        setSubmitting(false);
        return;
      }
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full sm:max-w-md bg-gray-950 sm:rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >

        {/* ── Step 2 store photo banner (full-bleed, replaces plain header) ── */}
        {step === 2 && storePhoto ? (
          <div className="relative h-28 shrink-0 overflow-hidden">
            <img
              src={ikUrl(storePhoto, 'card')}
              alt={storeName}
              className="w-full h-full object-cover"
            />
            {/* Strong gradient so header controls are always readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
            {/* Header controls on top of banner */}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3.5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                {[1, 2].map(s => (
                  <div
                    key={s}
                    className="flex items-center justify-center rounded-full text-[10px] font-black transition-all duration-300"
                    style={{
                      width: 20, height: 20,
                      backgroundColor: step === s ? typeColor : `${typeColor}40`,
                      color: step === s ? '#000' : typeColor,
                    }}
                  >
                    {step > s ? <Check className="h-2.5 w-2.5" /> : s}
                  </div>
                ))}
                <button onClick={onClose} className="text-white/70 hover:text-white transition-colors ml-1">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
            {/* Store name + type badge bottom of banner */}
            <div className="absolute inset-x-0 bottom-0 px-4 pb-3 flex items-end justify-between">
              <div>
                <p className="text-white font-bold text-sm leading-tight">{storeName}</p>
                <p className="text-white/50 text-xs">{neighborhood ? `${neighborhood} · ` : ''}{city}</p>
              </div>
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0"
                style={{ backgroundColor: `${typeColor}25`, color: typeColor, border: `1px solid ${typeColor}40` }}
              >
                {type === 'visit' ? 'Visit' : 'Pickup'}
              </span>
            </div>
          </div>
        ) : (
          /* ── Standard header (step 1, or step 2 with no store photo) ── */
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2.5">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:text-white transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <h2 className="text-sm font-bold text-white">
                {step === 1 ? 'Submit a Find' : 'Add details'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2].map(s => (
                <div
                  key={s}
                  className="flex items-center justify-center rounded-full text-[10px] font-black transition-all duration-300"
                  style={{
                    width: 20, height: 20,
                    backgroundColor: step === s ? typeColor : step > s ? `${typeColor}30` : 'rgb(31,41,55)',
                    color: step === s ? '#000' : step > s ? typeColor : 'rgb(75,85,99)',
                    border: step > s ? `1px solid ${typeColor}50` : 'none',
                  }}
                >
                  {step > s ? <Check className="h-2.5 w-2.5" /> : s}
                </div>
              ))}
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors ml-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Body (scrollable) ── */}
        <div className="overflow-y-auto flex-1">
          <AnimatePresence mode="wait">

            {/* ════════════════ STEP 1 ════════════════ */}
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="p-4 space-y-3.5"
              >
                {/* ── Inline type toggle — small, secondary ── */}
                <div
                  className="flex p-0.5 rounded-lg gap-0.5"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {([
                    { id: 'visit' as const, label: 'Visited', icon: MapPin, color: '#22d9ee' },
                    { id: 'haul' as const, label: 'Picked up', icon: ShoppingBag, color: '#a855f7' },
                  ]).map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setType(opt.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200"
                      style={{
                        backgroundColor: type === opt.id ? `${opt.color}18` : 'transparent',
                        color: type === opt.id ? opt.color : 'rgb(107,114,128)',
                      }}
                    >
                      <opt.icon className="h-3 w-3" />
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* ── Store search / hero selected card ── */}
                <div className="relative">
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Store</label>
                  {selectedStore ? (
                    /* Hero store card — larger photo, prominent layout */
                    <div
                      className="relative rounded-xl overflow-hidden border"
                      style={{ borderColor: `${typeColor}20` }}
                    >
                      {/* Photo banner or gradient fallback */}
                      {selectedStore.photos?.[0] ? (
                        <div className="relative h-20 overflow-hidden">
                          <img
                            src={ikUrl(selectedStore.photos[0], 'card')}
                            alt={selectedStore.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
                        </div>
                      ) : (
                        <div className="h-10" style={{ background: `linear-gradient(135deg, ${typeColor}15, transparent)` }} />
                      )}
                      {/* Store info overlaid at bottom of banner */}
                      <div className="relative px-3 pb-3" style={{ marginTop: selectedStore.photos?.[0] ? '-28px' : '0' }}>
                        <div className="flex items-end justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-bold text-[15px] leading-tight truncate">{selectedStore.name}</p>
                            <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />
                              {selectedStore.neighborhood ? `${selectedStore.neighborhood}, ` : ''}{selectedStore.city}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={clearStore}
                            className="text-gray-600 hover:text-white transition-colors shrink-0 p-1 -mb-0.5"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                        <input
                          type="text"
                          value={storeSearch}
                          onChange={e => setStoreSearch(e.target.value)}
                          placeholder="Search stores..."
                          className="w-full bg-gray-900/80 border border-white/6 rounded-xl pl-8 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/15 transition-colors"
                        />
                      </div>
                      {storeResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
                          {storeResults.map(store => (
                            <button
                              key={store.id}
                              type="button"
                              onClick={() => selectStore(store)}
                              className="w-full text-left px-3 py-2.5 hover:bg-gray-800 transition-colors flex items-center gap-3"
                            >
                              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-gray-800 flex items-center justify-center">
                                {store.photos?.[0] ? (
                                  <img src={ikUrl(store.photos[0], 'thumb')} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <MapPin className="h-3.5 w-3.5 text-gray-600" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-white text-sm font-medium truncate">{store.name}</p>
                                <p className="text-gray-500 text-xs truncate">{store.neighborhood ? `${store.neighborhood}, ` : ''}{store.city}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {storeSearch.length >= 2 && storeResults.length === 0 && (
                        <button
                          type="button"
                          onClick={() => { setStoreName(storeSearch); setStoreSearch(''); }}
                          className="w-full mt-1 text-left px-3 py-2.5 bg-gray-900/80 border border-dashed border-white/8 rounded-xl text-gray-400 text-sm hover:border-white/15 transition-colors flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add <span className="text-white font-medium ml-1">"{storeSearch}"</span>
                        </button>
                      )}
                      {storeName && !selectedStore && (
                        <p className="text-gray-600 text-xs mt-1.5">
                          Adding: <span className="text-gray-300">{storeName}</span>
                          <button type="button" onClick={() => setStoreName('')} className="ml-2 underline hover:text-gray-400">clear</button>
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* ── City + Neighborhood ── */}
                {/* When store is selected, collapse to read-only since values auto-filled */}
                {selectedStore ? (
                  <></> // Location shown in the hero card above — no need to repeat
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {/* City */}
                    <div className="relative">
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">City</label>
                      <button
                        type="button"
                        onClick={() => { setCityOpen(o => !o); setNeighborhoodOpen(false); }}
                        className="w-full flex items-center justify-between bg-gray-900/80 border rounded-xl px-3 py-2.5 text-sm transition-colors hover:border-white/15 focus:outline-none"
                        style={{ borderColor: city ? `${typeColor}40` : 'rgba(255,255,255,0.06)' }}
                      >
                        <span className={`truncate ${city ? 'text-white font-medium' : 'text-gray-600'}`} style={{ fontSize: 13 }}>
                          {city || 'Select'}
                        </span>
                        <ChevronDown className={`h-3.5 w-3.5 text-gray-500 shrink-0 transition-transform duration-200 ${cityOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {cityOpen && (
                        <div className="absolute z-20 w-56 mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl max-h-52 overflow-y-auto">
                          {MAJOR_CITIES_JAPAN.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => handleCitySelect(c)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 transition-colors flex items-center justify-between"
                              style={{ color: city === c ? typeColor : 'rgb(209,213,219)' }}
                            >
                              {c}
                              {city === c && <Check className="h-3 w-3" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Neighborhood */}
                    <div className="relative">
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Area</label>
                      {neighborhoodOptions.length > 0 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => { setNeighborhoodOpen(o => !o); setCityOpen(false); }}
                            className="w-full flex items-center justify-between bg-gray-900/80 border rounded-xl px-3 py-2.5 text-sm transition-colors hover:border-white/15 focus:outline-none"
                            style={{ borderColor: neighborhood ? `${typeColor}40` : 'rgba(255,255,255,0.06)' }}
                          >
                            <span className={`truncate ${neighborhood ? 'text-white font-medium' : 'text-gray-600'}`} style={{ fontSize: 13 }}>
                              {neighborhood || 'Select'}
                            </span>
                            <ChevronDown className={`h-3.5 w-3.5 text-gray-500 shrink-0 transition-transform duration-200 ${neighborhoodOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {neighborhoodOpen && (
                            <div className="absolute z-20 w-56 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
                              <div className="p-2 border-b border-gray-800">
                                <input
                                  type="text"
                                  value={neighborhoodSearch}
                                  onChange={e => setNeighborhoodSearch(e.target.value)}
                                  placeholder="Search..."
                                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none"
                                  autoFocus
                                />
                              </div>
                              <div className="max-h-44 overflow-y-auto">
                                {neighborhood && (
                                  <button type="button" onClick={() => handleNeighborhoodSelect('')} className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-800 italic">
                                    Clear
                                  </button>
                                )}
                                {filteredNeighborhoods.map(n => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => handleNeighborhoodSelect(n)}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 transition-colors flex items-center justify-between"
                                    style={{ color: neighborhood === n ? typeColor : 'rgb(209,213,219)' }}
                                  >
                                    {n}
                                    {neighborhood === n && <Check className="h-3 w-3" />}
                                  </button>
                                ))}
                                {filteredNeighborhoods.length === 0 && (
                                  <button
                                    type="button"
                                    onClick={() => { setNeighborhood(neighborhoodSearch); setNeighborhoodOpen(false); setNeighborhoodSearch(''); }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 flex items-center gap-2"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add "{neighborhoodSearch}"
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <input
                          type="text"
                          value={neighborhood}
                          onChange={e => setNeighborhood(e.target.value)}
                          placeholder={city ? 'Enter area' : '—'}
                          disabled={!city}
                          className="w-full bg-gray-900/80 border border-white/6 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/15 transition-colors disabled:opacity-40"
                        />
                      )}
                    </div>
                  </div>
                )}

                {step1Error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {step1Error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm tracking-wide transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: `linear-gradient(135deg, ${typeColor}, ${type === 'visit' ? '#3b82f6' : '#7c3aed'})`,
                    color: '#000',
                    boxShadow: `0 0 20px ${typeColor}30`,
                  }}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>

            ) : (
            /* ════════════════ STEP 2 ════════════════ */
              <motion.form
                key="step2"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.18 }}
                className="p-4 space-y-4"
              >
                {/* Summary bar (only when no store photo banner) */}
                {!storePhoto && (
                  <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                    style={{ backgroundColor: `${typeColor}08`, borderColor: `${typeColor}20` }}
                  >
                    {type === 'visit'
                      ? <MapPin className="h-4 w-4 shrink-0" style={{ color: typeColor }} />
                      : <ShoppingBag className="h-4 w-4 shrink-0" style={{ color: typeColor }} />
                    }
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-semibold truncate">{storeName}</p>
                      <p className="text-gray-500 text-xs truncate">{neighborhood ? `${neighborhood}, ` : ''}{city}</p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest shrink-0 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${typeColor}20`, color: typeColor }}>
                      {type === 'visit' ? 'Visit' : 'Pickup'}
                    </span>
                  </div>
                )}

                {/* ── Photo upload as post-preview card ── */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-gray-500">
                      Photo {type === 'haul'
                        ? <span style={{ color: typeColor }}>*</span>
                        : <span className="text-gray-600 font-normal">(optional)</span>}
                    </label>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                        className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <X className="h-3 w-3" /> Remove
                      </button>
                    )}
                  </div>

                  {photoPreview ? (
                    /* Preview looks like the final find card */
                    <div
                      className="relative w-full rounded-xl overflow-hidden cursor-pointer"
                      style={{ paddingBottom: '125%' }}
                      onClick={() => fileRef.current?.click()}
                    >
                      <img src={photoPreview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                      {/* Tap to change hint */}
                      <div className="absolute bottom-3 inset-x-0 flex justify-center">
                        <span className="text-white/50 text-xs px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                          Tap to change
                        </span>
                      </div>
                      {/* Type badge preview */}
                      <div
                        className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-widest backdrop-blur-sm"
                        style={{ backgroundColor: `${typeColor}25`, border: `1px solid ${typeColor}50`, color: typeColor }}
                      >
                        {type === 'visit' ? <MapPin className="h-2.5 w-2.5" /> : <ShoppingBag className="h-2.5 w-2.5" />}
                        {type === 'visit' ? 'Visited' : 'Picked up'}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full rounded-xl flex flex-col items-center justify-center gap-3 transition-all group"
                      style={{
                        height: 140,
                        borderWidth: 1.5,
                        borderStyle: 'dashed',
                        borderColor: `${typeColor}25`,
                        backgroundColor: `${typeColor}04`,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = `${typeColor}50`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = `${typeColor}25`; }}
                    >
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${typeColor}12` }}>
                        <Camera className="h-4.5 w-4.5" style={{ color: typeColor }} />
                      </div>
                      <div className="text-center">
                        <p className="text-white text-sm font-semibold">Add a photo</p>
                        <p className="text-gray-600 text-xs mt-0.5">
                          {type === 'haul' ? 'Show off what you picked up' : 'Show what the store looks like'}
                        </p>
                      </div>
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </div>

                {/* ── Item name (haul only) ── */}
                {type === 'haul' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                      What did you pick up? <span style={{ color: typeColor }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={itemName}
                      onChange={e => setItemName(e.target.value)}
                      placeholder="e.g. Issey Miyake Pleats Please jacket"
                      className="w-full bg-gray-900/80 border border-white/6 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/15 transition-colors"
                    />
                  </div>
                )}

                {/* ── Caption (auto-expand) ── */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                    Caption <span className="text-gray-600 font-normal">(optional)</span>
                  </label>
                  <textarea
                    ref={captionRef}
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    maxLength={280}
                    rows={2}
                    placeholder={type === 'haul' ? 'Tell the story behind the find...' : 'What made this place worth visiting?'}
                    className="w-full bg-gray-900/80 border border-white/6 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/15 resize-none transition-colors overflow-hidden"
                    style={{ minHeight: 68 }}
                  />
                  <p className="text-gray-700 text-[11px] mt-1 text-right">{caption.length}/280</p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${typeColor}, ${type === 'visit' ? '#3b82f6' : '#7c3aed'})`,
                    color: '#000',
                    boxShadow: `0 0 20px ${typeColor}35`,
                  }}
                >
                  {submitting ? (
                    <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                  ) : (
                    <><Check className="h-4 w-4" /> Submit Find</>
                  )}
                </button>

                <p className="text-center text-gray-700 text-[11px] pb-1">
                  Finds are reviewed before appearing publicly.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Submitted confirmation ─────────────────────────────────────────────────────

function SubmittedBanner({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-gray-900 border border-purple-500/40 rounded-2xl shadow-2xl text-sm text-white"
    >
      <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
      Your find has been submitted for review. Thanks!
      <button onClick={onDismiss} className="text-gray-500 hover:text-white ml-2">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const CITIES = ['All Cities', 'Tokyo', 'Osaka', 'Kyoto', 'Fukuoka', 'Nagoya', 'Sapporo'];

export function FindsPage() {
  const { user } = useAuthContext();
  const [finds, setFinds] = useState<Find[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'visit' | 'haul'>('all');
  const [filterCity, setFilterCity] = useState('All Cities');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 24;
  const pageRef = useRef(0);

  async function fetchFinds(reset = false) {
    if (reset) pageRef.current = 0;
    const start = pageRef.current * PAGE_SIZE;
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
    const fetched = (data as Find[]) || [];

    setFinds(prev => reset ? fetched : [...prev, ...fetched]);
    setHasMore(fetched.length === PAGE_SIZE);
    pageRef.current += 1;
    setLoading(false);
  }

  useEffect(() => {
    fetchFinds(true);
  }, [filterType, filterCity]);

  function handleSubmitted() {
    setShowBanner(true);
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/4 rounded-full blur-3xl" />
      </div>

      {/* Submitted confirmation banner */}
      <AnimatePresence>
        {showBanner && <SubmittedBanner onDismiss={() => setShowBanner(false)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="relative border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/map" className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-400 text-sm transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to map
            </Link>
            <span className="text-gray-800">·</span>
            <Link to="/" className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-400 text-sm transition-colors">
              <MapPin className="h-3.5 w-3.5" />
              Lost in Transit
            </Link>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1
                className="font-display text-5xl sm:text-6xl font-black text-white italic"
                style={{ textShadow: '0 0 30px rgba(168,85,247,0.4)' }}
              >
                FINDS
              </h1>
              <p className="mt-2 text-gray-400 text-lg">
                Real visits & pickups from the community
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
                { id: 'haul' as const, label: 'Pickups', icon: ShoppingBag, color: '#a855f7' },
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
        {loading && finds.length === 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid mb-4 rounded-xl bg-gray-900 animate-pulse"
                style={{ height: `${200 + (i % 3) * 80}px` }}
              />
            ))}
          </div>
        ) : finds.length === 0 ? (
          <div className="text-center py-24">
            <Camera className="h-12 w-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-lg">No finds yet</p>
            <p className="text-gray-600 text-sm mt-2">
              {filterType !== 'all' || filterCity !== 'All Cities'
                ? 'Try adjusting your filters'
                : 'Be the first to share a visit or pickup'}
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
              {finds.map(find => (
                <FindCard key={find.id} find={find} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => fetchFinds()}
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
