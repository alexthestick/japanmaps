import { useState, useRef, useEffect, useMemo } from 'react';
import Draggable from 'react-draggable';
import { toPng } from 'html-to-image';
import { Button } from '../common/Button';
import { supabase } from '../../lib/supabase';
import type { Store } from '../../types/store';

const CANVAS_W = 1080;
const CANVAS_H = 1350;
const SCALE = 0.4;

const SINGLE_SLIDE_LABELS = ['1 · Cover', '2 · Info', '3 · Detail', '4 · Address', '5 · Photo'];

type CarouselMode = 'single' | 'category' | 'neighborhood' | 'new-additions' | 'city-mix';

interface MultiSlide {
  type: 'cover' | 'store' | 'cta';
  store?: Store;
  photoIdx: number;
  caption: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

async function fetchImageAsBase64(url: string): Promise<string> {
  const toBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  if (url.startsWith('https://ik.imagekit.io/wscyshoygv/')) {
    try {
      const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const blob = await res.blob();
        if (blob.type.startsWith('image/')) return await toBase64(blob);
      }
    } catch { /* fall through */ }
  }

  for (const proxy of [
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  ]) {
    try {
      const res = await fetch(proxy);
      if (!res.ok) continue;
      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) continue;
      return await toBase64(blob);
    } catch { continue; }
  }

  throw new Error('All proxies failed');
}

// ─── CarouselCreator ─────────────────────────────────────────────────────────

export function CarouselCreator() {

  // ── Single-store state ───────────────────────────────────────────────────
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loadingStores, setLoadingStores] = useState(false);

  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const storePickerRef = useRef<HTMLDivElement>(null);

  const [activeSlide, setActiveSlide] = useState(0);

  const [slideImages, setSlideImages] = useState<Record<number, string>>({});
  const [slidePhotoIdx, setSlidePhotoIdx] = useState<Record<number, number>>({
    0: 0, 1: 1, 2: 2, 3: 3, 4: 4,
  });
  const [bgLoading, setBgLoading] = useState<Record<number, boolean>>({});

  const [storeName, setStoreName] = useState('');
  const [location, setLocation] = useState('');
  const [hook, setHook] = useState('');
  const [caption2, setCaption2] = useState('');
  const [caption3, setCaption3] = useState('');
  const [igCaption, setIgCaption] = useState('');

  const [showHook, setShowHook] = useState(true);
  const [showGradient, setShowGradient] = useState(true);

  // Shared style
  const [storeNameSize, setStoreNameSize] = useState(60);
  const [storeNameColor, setStoreNameColor] = useState('#FFFFFF');
  const [locationSize, setLocationSize] = useState(32);
  const [locationColor, setLocationColor] = useState('#00D9FF');
  const [logoSize, setLogoSize] = useState(36);
  const [logoColor, setLogoColor] = useState('#00D9FF');
  const [iconColor, setIconColor] = useState('#00D9FF');
  const [cornerSize, setCornerSize] = useState(24);
  const [categoryIconSize, setCategoryIconSize] = useState(60);
  const [categoryIconColor, setCategoryIconColor] = useState('#00D9FF');

  const [hookSize, setHookSize] = useState(96);
  const [hookColor, setHookColor] = useState('#FFFFFF');
  const [captionSize, setCaptionSize] = useState(52);
  const [captionColor, setCaptionColor] = useState('#FFFFFF');

  // Design toggles
  const [showCorners, setShowCorners] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [showTrainIcon, setShowTrainIcon] = useState(true);
  const [showCategoryIcon, setShowCategoryIcon] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Fashion');

  // Drag positions (shared across slides for logo/icon)
  const [logoPos, setLogoPos] = useState({ x: 50, y: 50 });
  const [iconPos, setIconPos] = useState({ x: 950, y: 50 });
  const [categoryIconPos, setCategoryIconPos] = useState({ x: 50, y: 1270 });

  // Single-store per-slide positions
  const [namePosMap, setNamePosMap] = useState<Record<number, { x: number; y: number }>>({
    0: { x: 50, y: 1150 }, 1: { x: 50, y: 1150 }, 2: { x: 50, y: 1150 },
    3: { x: 50, y: 1150 }, 4: { x: 50, y: 1150 },
  });
  const [locPosMap, setLocPosMap] = useState<Record<number, { x: number; y: number }>>({
    0: { x: 50, y: 1220 }, 1: { x: 50, y: 1220 }, 2: { x: 50, y: 1220 },
    3: { x: 50, y: 1220 }, 4: { x: 50, y: 1220 },
  });
  const [hookPos, setHookPos] = useState({ x: 50, y: 480 });
  const [cap2Pos, setCap2Pos] = useState({ x: 50, y: 400 });
  const [cap3Pos, setCap3Pos] = useState({ x: 50, y: 400 });
  const [addressPos, setAddressPos] = useState({ x: 50, y: 820 });

  // Custom caption per slide
  const [showCustomCaption, setShowCustomCaption] = useState<Record<number, boolean>>({});
  const [customCaptionText, setCustomCaptionText] = useState<Record<number, string>>({});
  const [customCaptionSize, setCustomCaptionSize] = useState<Record<number, number>>({
    0: 48, 1: 48, 2: 48, 3: 48, 4: 48,
  });
  const [customCaptionColor, setCustomCaptionColor] = useState<Record<number, string>>({
    0: '#FFFFFF', 1: '#FFFFFF', 2: '#FFFFFF', 3: '#FFFFFF', 4: '#FFFFFF',
  });
  const [customCaptionPosMap, setCustomCaptionPosMap] = useState<Record<number, { x: number; y: number }>>({
    0: { x: 50, y: 700 }, 1: { x: 50, y: 700 }, 2: { x: 50, y: 700 },
    3: { x: 50, y: 700 }, 4: { x: 50, y: 700 },
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Multi-store state ────────────────────────────────────────────────────
  const [carouselMode, setCarouselMode] = useState<CarouselMode>('single');
  const [multiCity, setMultiCity] = useState('');
  const [multiCategory, setMultiCategory] = useState('Fashion');
  const [multiNeighborhood, setMultiNeighborhood] = useState('');
  const [multiDays, setMultiDays] = useState(30);
  const [multiTitle, setMultiTitle] = useState('');
  const [multiSubtitle, setMultiSubtitle] = useState('');
  const [multiCTAText, setMultiCTAText] = useState('DISCOVER MORE');
  const [multiSlides, setMultiSlides] = useState<MultiSlide[]>([]);
  const [multiImageCache, setMultiImageCache] = useState<Record<string, string>>({});
  const [multiImageLoading, setMultiImageLoading] = useState<Record<string, boolean>>({});
  const [multiNamePosMap, setMultiNamePosMap] = useState<Record<number, { x: number; y: number }>>({});
  const [multiLocPosMap, setMultiLocPosMap] = useState<Record<number, { x: number; y: number }>>({});
  const [multiCaptionPosMap, setMultiCaptionPosMap] = useState<Record<number, { x: number; y: number }>>({});
  const [buildingSlides, setBuildingSlides] = useState(false);

  // ── Single-store effects ─────────────────────────────────────────────────

  useEffect(() => { fetchStores(); }, []);

  useEffect(() => {
    if (!selectedStore) return;
    setStoreName(selectedStore.name);
    setLocation(
      `${selectedStore.city}${selectedStore.neighborhood ? ' • ' + selectedStore.neighborhood : ''}`
    );
    setHook(''); setCaption2(''); setCaption3(''); setIgCaption('');
    setSlideImages({}); setAiError('');
    const photoCount = selectedStore.photos?.length ?? 0;
    const defaults: Record<number, number> = {};
    for (let i = 0; i < 5; i++) defaults[i] = Math.min(i, Math.max(0, photoCount - 1));
    setSlidePhotoIdx(defaults);
  }, [selectedStore]);

  // Load photo when slide changes (single-store)
  useEffect(() => {
    if (carouselMode !== 'single') return;
    const photos = selectedStore?.photos;
    if (!photos || photos.length === 0) return;
    const idx = slidePhotoIdx[activeSlide] ?? 0;
    const url = photos[Math.min(idx, photos.length - 1)];
    if (!url || slideImages[activeSlide]) return;
    setBgLoading(prev => ({ ...prev, [activeSlide]: true }));
    fetchImageAsBase64(url)
      .then(b64 => setSlideImages(prev => ({ ...prev, [activeSlide]: b64 })))
      .catch(() => {
        const raw = photos[Math.min(idx, photos.length - 1)];
        setSlideImages(prev => ({ ...prev, [activeSlide]: raw }));
      })
      .finally(() => setBgLoading(prev => ({ ...prev, [activeSlide]: false })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlide, selectedStore]);

  // Reload when photo index changes (single-store)
  useEffect(() => {
    if (carouselMode !== 'single') return;
    const photos = selectedStore?.photos;
    if (!photos || photos.length === 0) return;
    const idx = slidePhotoIdx[activeSlide] ?? 0;
    const url = photos[Math.min(idx, photos.length - 1)];
    if (!url) return;
    setBgLoading(prev => ({ ...prev, [activeSlide]: true }));
    setSlideImages(prev => ({ ...prev, [activeSlide]: '' }));
    fetchImageAsBase64(url)
      .then(b64 => setSlideImages(prev => ({ ...prev, [activeSlide]: b64 })))
      .catch(() => {
        const raw = photos[Math.min(idx, photos.length - 1)];
        setSlideImages(prev => ({ ...prev, [activeSlide]: raw }));
      })
      .finally(() => setBgLoading(prev => ({ ...prev, [activeSlide]: false })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slidePhotoIdx]);

  // ── Multi-store effects ──────────────────────────────────────────────────

  // Reset slide index when mode changes
  useEffect(() => { setActiveSlide(0); }, [carouselMode]);

  // Load image for active multi-store slide
  useEffect(() => {
    if (carouselMode === 'single') return;
    const slide = multiSlides[activeSlide];
    if (!slide?.store) return;
    const key = `${slide.store.id}-${slide.photoIdx}`;
    if (multiImageCache[key]) return;
    const url = slide.store.photos[slide.photoIdx];
    if (!url) return;
    setMultiImageLoading(prev => ({ ...prev, [key]: true }));
    fetchImageAsBase64(url)
      .then(b64 => setMultiImageCache(prev => ({ ...prev, [key]: b64 })))
      .catch(() => {
        const raw = slide.store!.photos[slide.photoIdx];
        setMultiImageCache(prev => ({ ...prev, [key]: raw }));
      })
      .finally(() => setMultiImageLoading(prev => ({ ...prev, [key]: false })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlide, carouselMode, multiSlides]);

  // ── Data fetching ─────────────────────────────────────────────────────────

  async function fetchStores() {
    setLoadingStores(true);
    try {
      // Use get_all_stores_json — returns ALL stores as a single JSONB blob,
      // bypassing PostgREST's 1000-row limit that get_stores_with_coordinates hits.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc('get_all_stores_json');
      if (error) throw error;
      const rows: any[] = Array.isArray(data) ? data : [];
      const transformed: Store[] = rows.map((s: any) => ({
        id: s.id, name: s.name, address: s.address, city: s.city,
        neighborhood: s.neighborhood || undefined, country: s.country,
        latitude: s.latitude, longitude: s.longitude,
        mainCategory: s.main_category || 'Fashion', categories: s.categories || [],
        priceRange: s.price_range || undefined, description: s.description || undefined,
        photos: s.photos || [], website: s.website || undefined,
        instagram: s.instagram || undefined, hours: s.hours || undefined,
        verified: s.verified, submittedBy: s.submitted_by || undefined,
        createdAt: s.created_at, updatedAt: s.updated_at,
        haulCount: s.haul_count || 0, saveCount: s.save_count || 0,
        kurb_vendor_id: s.kurb_vendor_id ?? null,
      }));
      transformed.sort((a, b) => a.name.localeCompare(b.name));
      setStores(transformed);
    } catch (e) {
      console.error('Error fetching stores:', e);
    } finally {
      setLoadingStores(false);
    }
  }

  // ── Store picker dropdown ─────────────────────────────────────────────────

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (storePickerRef.current && !storePickerRef.current.contains(e.target as Node)) {
        setShowStoreDropdown(false);
        if (selectedStore) setStoreSearchQuery(selectedStore.name);
        else setStoreSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedStore]);

  const filteredStores = storeSearchQuery.trim() === ''
    ? stores
    : stores.filter(s =>
        s.name.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
        s.city.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
        (s.neighborhood || '').toLowerCase().includes(storeSearchQuery.toLowerCase())
      );

  // ── Multi-store computed lists ────────────────────────────────────────────

  const cities = useMemo(() =>
    [...new Set(stores.map(s => s.city).filter(Boolean))].sort()
  , [stores]);

  const neighborhoods = useMemo(() => {
    const pool = multiCity ? stores.filter(s => s.city === multiCity) : stores;
    return [...new Set(pool.map(s => s.neighborhood).filter((n): n is string => !!n))].sort();
  }, [stores, multiCity]);

  // ── AI generate (single-store only) ──────────────────────────────────────

  async function handleAiGenerate() {
    if (!selectedStore) return;
    setAiLoading(true); setAiError('');
    try {
      const { data, error } = await supabase.functions.invoke('generate-carousel-copy', {
        body: {
          name: selectedStore.name, city: selectedStore.city,
          neighborhood: selectedStore.neighborhood || '',
          description: selectedStore.description || '',
          categories: selectedStore.categories || [selectedStore.mainCategory],
          address: selectedStore.address || '', instagram: selectedStore.instagram || '',
        },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'AI generation failed');
      const c = data.copy;
      if (c.hook) setHook(c.hook);
      if (c.caption2) setCaption2(c.caption2);
      if (c.caption3) setCaption3(c.caption3);
      if (c.ig_caption) setIgCaption(c.ig_caption);
    } catch (e: any) {
      setAiError(e.message || 'Failed to generate copy');
    } finally {
      setAiLoading(false);
    }
  }

  // ── Export ────────────────────────────────────────────────────────────────

  async function exportCurrentCanvas(filename: string) {
    if (!canvasRef.current) return;
    const el = canvasRef.current;
    const orig = el.style.transform;
    el.style.transform = 'none';
    try {
      const dataUrl = await toPng(el, {
        quality: 1, pixelRatio: 2, width: CANVAS_W, height: CANVAS_H, skipFonts: true,
      });
      const link = document.createElement('a');
      link.download = filename; link.href = dataUrl; link.click();
    } finally {
      el.style.transform = orig;
    }
  }

  async function handleExportCurrent() {
    setExporting(true);
    if (carouselMode === 'single') {
      const slug = (storeName || 'slide').toLowerCase().replace(/\s+/g, '-');
      await exportCurrentCanvas(`${slug}-slide${activeSlide + 1}.png`);
    } else {
      const prefix = (multiTitle || 'carousel').toLowerCase().replace(/\s+/g, '-');
      await exportCurrentCanvas(`${prefix}-slide${activeSlide + 1}.png`);
    }
    setExporting(false);
  }

  async function handleExportAll() {
    setExporting(true);
    const original = activeSlide;
    if (carouselMode === 'single') {
      if (!selectedStore) { setExporting(false); return; }
      const slug = (storeName || 'slide').toLowerCase().replace(/\s+/g, '-');
      for (let i = 0; i < 5; i++) {
        setActiveSlide(i);
        await new Promise(r => setTimeout(r, 350));
        await exportCurrentCanvas(`${slug}-slide${i + 1}.png`);
      }
    } else {
      if (multiSlides.length === 0) { setExporting(false); return; }
      const prefix = (multiTitle || 'carousel').toLowerCase().replace(/\s+/g, '-');
      for (let i = 0; i < multiSlides.length; i++) {
        setActiveSlide(i);
        await new Promise(r => setTimeout(r, 450));
        await exportCurrentCanvas(`${prefix}-slide${i + 1}.png`);
      }
    }
    setActiveSlide(original);
    setExporting(false);
  }

  // ── Multi-store slide building ────────────────────────────────────────────

  function buildSlides() {
    setBuildingSlides(true);
    let pool: Store[] = [];

    switch (carouselMode) {
      case 'category':
        pool = stores.filter(s =>
          s.mainCategory === multiCategory &&
          (!multiCity || s.city === multiCity) &&
          s.photos && s.photos.length > 0
        );
        break;
      case 'neighborhood':
        pool = stores.filter(s =>
          !!s.neighborhood &&
          s.neighborhood === multiNeighborhood &&
          s.photos && s.photos.length > 0
        );
        break;
      case 'new-additions': {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - multiDays);
        pool = stores.filter(s =>
          new Date(s.createdAt) >= cutoff &&
          (!multiCity || s.city === multiCity) &&
          s.photos && s.photos.length > 0
        );
        break;
      }
      case 'city-mix':
        pool = stores.filter(s =>
          s.city === multiCity &&
          s.photos && s.photos.length > 0
        );
        break;
    }

    // Best-stocked stores first, take up to 6
    pool.sort((a, b) => (b.photos?.length ?? 0) - (a.photos?.length ?? 0));
    const selected = pool.slice(0, 6);

    const storeSlides: MultiSlide[] = selected.map(store => ({
      type: 'store', store, photoIdx: 0, caption: '',
    }));

    setMultiSlides([
      { type: 'cover', photoIdx: 0, caption: '' },
      ...storeSlides,
      { type: 'cta', photoIdx: 0, caption: '' },
    ]);
    setActiveSlide(0);
    setMultiNamePosMap({});
    setMultiLocPosMap({});
    setMultiCaptionPosMap({});
    setBuildingSlides(false);

    // Pre-load all store images
    selected.forEach(store => {
      const url = store.photos[0];
      if (!url) return;
      const key = `${store.id}-0`;
      if (multiImageCache[key]) return;
      setMultiImageLoading(prev => ({ ...prev, [key]: true }));
      fetchImageAsBase64(url)
        .then(b64 => setMultiImageCache(prev => ({ ...prev, [key]: b64 })))
        .catch(() => setMultiImageCache(prev => ({ ...prev, [key]: url })))
        .finally(() => setMultiImageLoading(prev => ({ ...prev, [key]: false })));
    });
  }

  function handleMultiPhotoChange(newIdx: number) {
    const slide = multiSlides[activeSlide];
    if (!slide?.store) return;
    setMultiSlides(prev => prev.map((s, i) => i === activeSlide ? { ...s, photoIdx: newIdx } : s));
    const key = `${slide.store.id}-${newIdx}`;
    if (multiImageCache[key]) return;
    const url = slide.store.photos[newIdx];
    if (!url) return;
    setMultiImageLoading(prev => ({ ...prev, [key]: true }));
    fetchImageAsBase64(url)
      .then(b64 => setMultiImageCache(prev => ({ ...prev, [key]: b64 })))
      .catch(() => setMultiImageCache(prev => ({ ...prev, [key]: url })))
      .finally(() => setMultiImageLoading(prev => ({ ...prev, [key]: false })));
  }

  function moveSlide(fromIdx: number, dir: 'up' | 'down') {
    const toIdx = dir === 'up' ? fromIdx - 1 : fromIdx + 1;
    // Protect cover (0) and CTA (last)
    if (fromIdx <= 0 || fromIdx >= multiSlides.length - 1) return;
    if (toIdx <= 0 || toIdx >= multiSlides.length - 1) return;
    setMultiSlides(prev => {
      const next = [...prev];
      [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
      return next;
    });
    setActiveSlide(toIdx);
  }

  function removeSlide(idx: number) {
    if (!multiSlides[idx] || multiSlides[idx].type !== 'store') return;
    setMultiSlides(prev => prev.filter((_, i) => i !== idx));
    if (activeSlide >= idx) setActiveSlide(Math.max(0, activeSlide - 1));
  }

  // ── Derived multi canvas values ───────────────────────────────────────────

  const activeMultiSlide: MultiSlide | null = multiSlides[activeSlide] ?? null;
  const multiStoreKey = activeMultiSlide?.store
    ? `${activeMultiSlide.store.id}-${activeMultiSlide.photoIdx}`
    : '';
  const activeMultiImage = multiStoreKey ? (multiImageCache[multiStoreKey] ?? '') : '';
  const isLoadingMultiBg = multiStoreKey ? (multiImageLoading[multiStoreKey] ?? false) : false;

  // Cover auto-background: first store slide's photo
  const firstStoreSlide = multiSlides.find(s => s.type === 'store');
  const coverBgKey = firstStoreSlide?.store
    ? `${firstStoreSlide.store.id}-${firstStoreSlide.photoIdx}`
    : '';
  const coverBgImage = coverBgKey ? (multiImageCache[coverBgKey] ?? '') : '';

  // Single-store canvas derived values
  const activeImage = slideImages[activeSlide] ?? '';
  const isLoadingBg = bgLoading[activeSlide] ?? false;
  const photos = selectedStore?.photos ?? [];

  // Slide labels (dynamic per mode)
  const slideLabels = carouselMode === 'single'
    ? SINGLE_SLIDE_LABELS
    : multiSlides.map((s, i) =>
        s.type === 'cover' ? '① Cover' :
        s.type === 'cta' ? `${i + 1} · CTA` :
        `${i + 1} · ${(s.store?.name ?? 'Store').slice(0, 8)}`
      );

  // ── Category icon ─────────────────────────────────────────────────────────

  const catIconJsx = (() => {
    switch (selectedCategory) {
      case 'Fashion': return <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />;
      case 'Food': return (<><path d="m16 2-2.3 12.3a2 2 0 0 1-2 1.7H8.3a2 2 0 0 1-2-1.7L4 2" /><path d="M7 22h10" /><path d="M12 16v6" /></>);
      case 'Coffee': return (<><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" x2="6" y1="2" y2="4" /><line x1="10" x2="10" y1="2" y2="4" /><line x1="14" x2="14" y1="2" y2="4" /></>);
      case 'Home Goods': return (<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>);
      case 'Museum': return (<><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 7h10" /><path d="M7 12h10" /><path d="M7 17h10" /></>);
      default: return (<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>);
    }
  })();

  // ── Shared canvas elements (corners, LTT icon, logo, category icon) ────────

  const sharedCanvasElements = (
    <>
      {showCorners && (
        <>
          <div className="absolute top-6 left-6 border-l-4 border-t-4 border-cyan-400"
            style={{ width: `${cornerSize * 4}px`, height: `${cornerSize * 4}px`, pointerEvents: 'none' }} />
          <div className="absolute top-6 right-6 border-r-4 border-t-4 border-cyan-400"
            style={{ width: `${cornerSize * 4}px`, height: `${cornerSize * 4}px`, pointerEvents: 'none' }} />
          <div className="absolute bottom-6 left-6 border-l-4 border-b-4 border-cyan-400"
            style={{ width: `${cornerSize * 4}px`, height: `${cornerSize * 4}px`, pointerEvents: 'none' }} />
          <div className="absolute bottom-6 right-6 border-r-4 border-b-4 border-cyan-400"
            style={{ width: `${cornerSize * 4}px`, height: `${cornerSize * 4}px`, pointerEvents: 'none' }} />
        </>
      )}
      {showTrainIcon && (
        <Draggable position={iconPos} onStop={(_, d) => setIconPos({ x: d.x, y: d.y })} bounds="parent">
          <div className="absolute cursor-move">
            <svg width="120" height="50" viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="40" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="48" fontWeight="900" fill={iconColor}>L</text>
              <g transform="translate(38, 5)">
                <rect x="0" y="8" width="24" height="22" rx="2" fill={iconColor} />
                <rect x="3" y="11" width="8" height="8" fill="#1a1a1a" />
                <rect x="13" y="11" width="8" height="8" fill="#1a1a1a" />
                <circle cx="6" cy="32" r="2.5" fill={iconColor} />
                <circle cx="18" cy="32" r="2.5" fill={iconColor} />
                <rect x="8" y="2" width="8" height="6" fill={iconColor} />
              </g>
              <text x="72" y="40" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="48" fontWeight="900" fill={iconColor}>T</text>
            </svg>
          </div>
        </Draggable>
      )}
      {showLogo && (
        <Draggable position={logoPos} onStop={(_, d) => setLogoPos({ x: d.x, y: d.y })} bounds="parent">
          <div className="absolute cursor-move" style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
            <div className="font-black tracking-wider" style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: `${logoSize}px`, color: logoColor,
              textShadow: '2px 2px 8px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', display: 'inline-block',
            }}>
              LOST IN TRANSIT
            </div>
          </div>
        </Draggable>
      )}
      {showCategoryIcon && (
        <Draggable position={categoryIconPos} onStop={(_, d) => setCategoryIconPos({ x: d.x, y: d.y })} bounds="parent">
          <div className="absolute cursor-move">
            <svg width={categoryIconSize} height={categoryIconSize} viewBox="0 0 24 24" fill="none"
              stroke={categoryIconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {catIconJsx}
            </svg>
          </div>
        </Draggable>
      )}
    </>
  );

  // ── Shared UI panels ──────────────────────────────────────────────────────

  const designElementsPanel = (
    <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <span className="text-lg">🎨</span> Design Elements
      </h3>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="corners" checked={showCorners} onChange={(e) => setShowCorners(e.target.checked)} className="w-4 h-4 text-cyan-500 border-gray-300 rounded" />
        <label htmlFor="corners" className="text-sm text-gray-700">Corner brackets</label>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="trainIcon" checked={showTrainIcon} onChange={(e) => setShowTrainIcon(e.target.checked)} className="w-4 h-4 text-cyan-500 border-gray-300 rounded" />
        <label htmlFor="trainIcon" className="text-sm text-gray-700">L-Train-T icon</label>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="logo" checked={showLogo} onChange={(e) => setShowLogo(e.target.checked)} className="w-4 h-4 text-cyan-500 border-gray-300 rounded" />
        <label htmlFor="logo" className="text-sm text-gray-700">LOST IN TRANSIT logo</label>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="catIcon" checked={showCategoryIcon} onChange={(e) => setShowCategoryIcon(e.target.checked)} className="w-4 h-4 text-cyan-500 border-gray-300 rounded" />
        <label htmlFor="catIcon" className="text-sm text-gray-700">Category icon</label>
      </div>
      {showCategoryIcon && (
        <div className="ml-6">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500">
            {['Fashion', 'Food', 'Coffee', 'Home Goods', 'Museum', 'Spots'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}
    </div>
  );

  const stylingPanel = (
    <details className="border border-gray-200 rounded-lg bg-white">
      <summary className="cursor-pointer text-sm font-semibold text-gray-800 p-4 hover:bg-gray-50 rounded-lg">
        🎨 Text &amp; Logo Styling
      </summary>
      <div className="px-4 pb-4 space-y-4">
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">LOST IN TRANSIT Logo</p>
          <div className="space-y-2">
            <div><label className="block text-xs text-gray-600 mb-1">Size: {logoSize}px</label>
              <input type="range" min="20" max="60" value={logoSize} onChange={(e) => setLogoSize(Number(e.target.value))} className="w-full" /></div>
            <div><label className="block text-xs text-gray-600 mb-1">Color</label>
              <input type="color" value={logoColor} onChange={(e) => setLogoColor(e.target.value)} className="w-full h-10 rounded cursor-pointer" /></div>
          </div>
        </div>
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">L-Train-T Icon</p>
          <div><label className="block text-xs text-gray-600 mb-1">Color</label>
            <input type="color" value={iconColor} onChange={(e) => setIconColor(e.target.value)} className="w-full h-10 rounded cursor-pointer" /></div>
        </div>
        {showCategoryIcon && (
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Category Icon</p>
            <div className="space-y-2">
              <div><label className="block text-xs text-gray-600 mb-1">Size: {categoryIconSize}px</label>
                <input type="range" min="30" max="100" value={categoryIconSize} onChange={(e) => setCategoryIconSize(Number(e.target.value))} className="w-full" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Color</label>
                <input type="color" value={categoryIconColor} onChange={(e) => setCategoryIconColor(e.target.value)} className="w-full h-10 rounded cursor-pointer" /></div>
            </div>
          </div>
        )}
        {showCorners && (
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Corner Brackets</p>
            <div><label className="block text-xs text-gray-600 mb-1">Size: {cornerSize}px</label>
              <input type="range" min="16" max="48" value={cornerSize} onChange={(e) => setCornerSize(Number(e.target.value))} className="w-full" /></div>
          </div>
        )}
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Store Name</p>
          <div className="space-y-2">
            <div><label className="block text-xs text-gray-600 mb-1">Size: {storeNameSize}px</label>
              <input type="range" min="30" max="120" value={storeNameSize} onChange={(e) => setStoreNameSize(Number(e.target.value))} className="w-full" /></div>
            <div><label className="block text-xs text-gray-600 mb-1">Color</label>
              <input type="color" value={storeNameColor} onChange={(e) => setStoreNameColor(e.target.value)} className="w-full h-10 rounded cursor-pointer" /></div>
          </div>
        </div>
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Location</p>
          <div className="space-y-2">
            <div><label className="block text-xs text-gray-600 mb-1">Size: {locationSize}px</label>
              <input type="range" min="20" max="80" value={locationSize} onChange={(e) => setLocationSize(Number(e.target.value))} className="w-full" /></div>
            <div><label className="block text-xs text-gray-600 mb-1">Color</label>
              <input type="color" value={locationColor} onChange={(e) => setLocationColor(e.target.value)} className="w-full h-10 rounded cursor-pointer" /></div>
          </div>
        </div>
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Hook / Title Text</p>
          <div className="space-y-2">
            <div><label className="block text-xs text-gray-600 mb-1">Size: {hookSize}px</label>
              <input type="range" min="40" max="160" value={hookSize} onChange={(e) => setHookSize(Number(e.target.value))} className="w-full" /></div>
            <div><label className="block text-xs text-gray-600 mb-1">Color</label>
              <input type="color" value={hookColor} onChange={(e) => setHookColor(e.target.value)} className="w-full h-10 rounded cursor-pointer" /></div>
          </div>
        </div>
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Caption Text</p>
          <div className="space-y-2">
            <div><label className="block text-xs text-gray-600 mb-1">Size: {captionSize}px</label>
              <input type="range" min="24" max="100" value={captionSize} onChange={(e) => setCaptionSize(Number(e.target.value))} className="w-full" /></div>
            <div><label className="block text-xs text-gray-600 mb-1">Color</label>
              <input type="color" value={captionColor} onChange={(e) => setCaptionColor(e.target.value)} className="w-full h-10 rounded cursor-pointer" /></div>
          </div>
        </div>
      </div>
    </details>
  );

  const exportPanel = (
    <div className="space-y-2">
      <Button
        onClick={handleExportCurrent}
        disabled={exporting || (carouselMode === 'single' ? (!activeImage || !storeName) : multiSlides.length === 0)}
        className="w-full py-4 text-lg font-semibold"
      >
        📥 Export Slide {activeSlide + 1}
      </Button>
      <button
        onClick={handleExportAll}
        disabled={exporting || (carouselMode === 'single' ? Object.keys(slideImages).length === 0 : multiSlides.length === 0)}
        className="w-full py-3 text-sm font-medium rounded-lg border-2 border-cyan-500 text-cyan-700 hover:bg-cyan-50 disabled:opacity-50 transition-all"
      >
        {exporting
          ? '⏳ Exporting…'
          : carouselMode === 'single'
            ? '📦 Export All 5 Slides'
            : `📦 Export All ${multiSlides.length} Slides`}
      </button>
      <p className="text-xs text-gray-500 text-center italic">💡 Drag any text on the canvas to reposition it</p>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // ── RENDER ───────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Carousel Creator</h2>

      {/* ── Mode Selector ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {([
          { mode: 'single', label: '🏪 Single Store', desc: '5-slide deep dive on one store' },
          { mode: 'category', label: '🏷️ Category Roundup', desc: 'Best stores by category & city' },
          { mode: 'neighborhood', label: '📍 Neighborhood Drop', desc: 'All stores in a neighborhood' },
          { mode: 'new-additions', label: '✨ New Additions', desc: 'Recently added stores' },
          { mode: 'city-mix', label: '🗺️ City Mix', desc: 'Cross-category city tour' },
        ] as { mode: CarouselMode; label: string; desc: string }[]).map(({ mode, label, desc }) => (
          <button
            key={mode}
            onClick={() => setCarouselMode(mode)}
            title={desc}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${
              carouselMode === mode
                ? 'bg-cyan-500 text-white border-cyan-500 shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:border-cyan-300 hover:text-cyan-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Left Panel ──────────────────────────────────────────────── */}
        <div className="space-y-5">

          {carouselMode === 'single' ? (
            /* ══ SINGLE-STORE LEFT PANEL ══════════════════════════════════ */
            <>
              {/* Store Selector */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-lg">🏪</span> Select Store
                  {stores.length > 0 && (
                    <span className="text-xs text-gray-400 font-normal">({stores.length} stores)</span>
                  )}
                </label>
                <div className="relative" ref={storePickerRef}>
                  <input
                    type="text"
                    value={storeSearchQuery}
                    onChange={(e) => { setStoreSearchQuery(e.target.value); setShowStoreDropdown(true); }}
                    onFocus={() => { setStoreSearchQuery(''); setShowStoreDropdown(true); }}
                    placeholder={loadingStores ? 'Loading stores...' : 'Type to search stores...'}
                    disabled={loadingStores}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  />
                  {selectedStore && !showStoreDropdown && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-cyan-700 font-semibold">
                      <span>✓</span>
                      <span>{selectedStore.name} — {selectedStore.city}</span>
                      <button
                        onClick={() => { setSelectedStore(null); setStoreSearchQuery(''); }}
                        className="ml-auto text-gray-400 hover:text-red-400 transition-colors"
                        title="Clear selection"
                      >✕</button>
                    </div>
                  )}
                  {showStoreDropdown && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
                      {filteredStores.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-gray-500 text-center">No stores found</div>
                      ) : (
                        filteredStores.slice(0, 80).map(store => (
                          <button
                            key={store.id}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-cyan-50 transition-colors border-b border-gray-100 last:border-0 ${
                              selectedStore?.id === store.id ? 'bg-cyan-50 font-semibold text-cyan-700' : 'text-gray-800'
                            }`}
                            onClick={() => {
                              setSelectedStore(store);
                              setStoreSearchQuery(store.name);
                              setShowStoreDropdown(false);
                              setActiveSlide(0);
                            }}
                          >
                            <span className="font-medium">{store.name}</span>
                            <span className="text-gray-400 text-xs ml-1.5">
                              {store.city}{store.neighborhood ? ` · ${store.neighborhood}` : ''}
                            </span>
                          </button>
                        ))
                      )}
                      {filteredStores.length > 80 && (
                        <div className="px-3 py-2 text-xs text-gray-400 text-center bg-gray-50">
                          Showing 80 of {filteredStores.length} — type more to narrow results
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Slide Tabs */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">🎞</span> Slides
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {SINGLE_SLIDE_LABELS.map((label, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      className={`py-2 px-1 rounded-md text-xs font-medium transition-all ${
                        activeSlide === i ? 'bg-cyan-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Picker */}
              {selectedStore && photos.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">📸</span> Photo for Slide {activeSlide + 1}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSlidePhotoIdx(prev => ({ ...prev, [activeSlide]: idx }))}
                        className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                          (slidePhotoIdx[activeSlide] ?? 0) === idx
                            ? 'border-cyan-500 ring-2 ring-cyan-500 shadow-md'
                            : 'border-gray-300 hover:border-cyan-300'
                        }`}
                      >
                        <img src={photo} alt={`${selectedStore.name} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Copy */}
              {selectedStore && (
                <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-lg">✨</span> AI Copy
                  </h3>
                  <p className="text-xs text-gray-500">Generate hook + captions for all slides at once. Edit any field after.</p>
                  <button
                    onClick={handleAiGenerate}
                    disabled={aiLoading}
                    className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold rounded-md hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 transition-all"
                  >
                    {aiLoading ? '✨ Generating...' : '✨ Generate Copy with AI'}
                  </button>
                  {aiError && <p className="text-xs text-red-500">{aiError}</p>}
                </div>
              )}

              {/* Text Content */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-lg">✏️</span> Text Content — Slide {activeSlide + 1}
                </h3>
                {activeSlide === 0 && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Hook (big cover text)</label>
                      <input type="text" value={hook} onChange={(e) => setHook(e.target.value)} placeholder="rare vintage finds"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="showHook" checked={showHook} onChange={(e) => setShowHook(e.target.checked)} className="w-4 h-4 text-cyan-500 border-gray-300 rounded" />
                        <label htmlFor="showHook" className="text-xs text-gray-700">Show hook</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="showGradient" checked={showGradient} onChange={(e) => setShowGradient(e.target.checked)} className="w-4 h-4 text-cyan-500 border-gray-300 rounded" />
                        <label htmlFor="showGradient" className="text-xs text-gray-700">Gradient overlay</label>
                      </div>
                    </div>
                  </>
                )}
                {activeSlide === 1 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Caption (Info)</label>
                    <textarea value={caption2} onChange={(e) => setCaption2(e.target.value)} placeholder="What the store carries and specializes in…" rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                  </div>
                )}
                {activeSlide === 2 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Caption (Detail)</label>
                    <textarea value={caption3} onChange={(e) => setCaption3(e.target.value)} placeholder="Location context or layout detail…" rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                  </div>
                )}
                {activeSlide === 3 && (
                  <div className="bg-gray-50 rounded p-3 text-xs text-gray-600">
                    <span className="font-medium">Address (auto):</span> {selectedStore?.address || 'Pulled from store data'}
                  </div>
                )}
                {activeSlide === 4 && (
                  <p className="text-xs text-gray-500 italic">Clean photo slide — no text overlay. Use the custom caption below if needed.</p>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Store Name</label>
                  <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="BOUT"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Tokyo • Asakusabashi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
              </div>

              {/* Custom Caption */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-lg">💬</span> Custom Caption — Slide {activeSlide + 1}
                </h3>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`showCC-${activeSlide}`}
                    checked={showCustomCaption[activeSlide] ?? false}
                    onChange={(e) => setShowCustomCaption(prev => ({ ...prev, [activeSlide]: e.target.checked }))}
                    className="w-4 h-4 text-cyan-500 border-gray-300 rounded" />
                  <label htmlFor={`showCC-${activeSlide}`} className="text-sm text-gray-700">Add custom caption overlay</label>
                </div>
                {(showCustomCaption[activeSlide] ?? false) && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Caption Text</label>
                      <textarea value={customCaptionText[activeSlide] ?? ''}
                        onChange={(e) => setCustomCaptionText(prev => ({ ...prev, [activeSlide]: e.target.value }))}
                        placeholder="Enter caption…" rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Font Size: {customCaptionSize[activeSlide] ?? 48}px</label>
                      <input type="range" min="24" max="120" value={customCaptionSize[activeSlide] ?? 48}
                        onChange={(e) => setCustomCaptionSize(prev => ({ ...prev, [activeSlide]: Number(e.target.value) }))} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
                      <div className="flex gap-2 flex-wrap">
                        <input type="color" value={customCaptionColor[activeSlide] ?? '#FFFFFF'}
                          onChange={(e) => setCustomCaptionColor(prev => ({ ...prev, [activeSlide]: e.target.value }))}
                          className="w-12 h-10 rounded cursor-pointer" />
                        {(['#FFFFFF', '#00D9FF', '#000000'] as const).map((col) => (
                          <button key={col}
                            onClick={() => setCustomCaptionColor(prev => ({ ...prev, [activeSlide]: col }))}
                            className={`px-3 py-1 text-xs rounded border ${(customCaptionColor[activeSlide] ?? '#FFFFFF') === col ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300'}`}>
                            {col === '#FFFFFF' ? 'White' : col === '#00D9FF' ? 'Cyan' : 'Black'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 italic">💡 Drag caption on canvas to reposition</p>
                  </div>
                )}
              </div>

              {/* IG Caption */}
              {igCaption && (
                <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-2">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-lg">📲</span> Instagram Caption
                  </h3>
                  <textarea value={igCaption} onChange={(e) => setIgCaption(e.target.value)} rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                  <button onClick={() => navigator.clipboard.writeText(igCaption)}
                    className="text-xs text-cyan-600 hover:text-cyan-800 font-medium">
                    Copy to clipboard
                  </button>
                </div>
              )}
            </>
          ) : (
            /* ══ MULTI-STORE LEFT PANEL ═══════════════════════════════════ */
            <>
              {/* Filter Section */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-4">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-lg">
                    {carouselMode === 'category' ? '🏷️' :
                     carouselMode === 'neighborhood' ? '📍' :
                     carouselMode === 'new-additions' ? '✨' : '🗺️'}
                  </span>
                  {carouselMode === 'category' && 'Category Roundup'}
                  {carouselMode === 'neighborhood' && 'Neighborhood Drop'}
                  {carouselMode === 'new-additions' && 'New Additions'}
                  {carouselMode === 'city-mix' && 'City Mix'}
                </h3>

                {carouselMode === 'category' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                      <select value={multiCategory} onChange={(e) => setMultiCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        {['Fashion', 'Food', 'Coffee', 'Home Goods', 'Museum', 'Spots'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">City (optional)</label>
                      <select value={multiCity} onChange={(e) => setMultiCity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="">All cities</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {carouselMode === 'neighborhood' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                      <select value={multiCity} onChange={(e) => { setMultiCity(e.target.value); setMultiNeighborhood(''); }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="">All cities</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Neighborhood</label>
                      <select value={multiNeighborhood} onChange={(e) => setMultiNeighborhood(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="">Pick one…</option>
                        {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {carouselMode === 'new-additions' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Time window</label>
                      <select value={multiDays} onChange={(e) => setMultiDays(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        {[7, 14, 30, 60, 90].map(d => <option key={d} value={d}>Last {d} days</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">City (optional)</label>
                      <select value={multiCity} onChange={(e) => setMultiCity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="">All cities</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {carouselMode === 'city-mix' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                    <select value={multiCity} onChange={(e) => setMultiCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                      <option value="">Pick a city…</option>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">Picks up to 6 stores with the most photos — mixed categories.</p>
                  </div>
                )}

                <button
                  onClick={buildSlides}
                  disabled={buildingSlides ||
                    (carouselMode === 'neighborhood' && !multiNeighborhood) ||
                    (carouselMode === 'city-mix' && !multiCity)}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 text-white font-semibold text-sm rounded-lg transition-colors"
                >
                  {buildingSlides ? '⏳ Building…' : '🎞 Build Slides'}
                </button>
              </div>

              {/* Slide Tabs (multi) */}
              {multiSlides.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">🎞</span> Slides
                    <span className="text-xs text-gray-400 font-normal">({multiSlides.length} total)</span>
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {slideLabels.map((label, i) => (
                      <button key={i} onClick={() => setActiveSlide(i)}
                        className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                          activeSlide === i ? 'bg-cyan-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Per-Slide Editor (multi) */}
              {multiSlides.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-lg">✏️</span> Slide {activeSlide + 1}
                    {activeMultiSlide?.type === 'cover' && <span className="text-xs text-gray-400 font-normal">— Cover</span>}
                    {activeMultiSlide?.type === 'store' && <span className="text-xs text-gray-400 font-normal">— {activeMultiSlide.store?.name}</span>}
                    {activeMultiSlide?.type === 'cta' && <span className="text-xs text-gray-400 font-normal">— CTA</span>}
                  </h3>

                  {/* Cover editor */}
                  {activeMultiSlide?.type === 'cover' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Title (big text)</label>
                        <input type="text" value={multiTitle} onChange={(e) => setMultiTitle(e.target.value)}
                          placeholder="TOKYO VINTAGE GUIDE"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle / Location</label>
                        <input type="text" value={multiSubtitle} onChange={(e) => setMultiSubtitle(e.target.value)}
                          placeholder="Tokyo, Japan"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                      </div>
                      <p className="text-xs text-gray-500 italic">Background uses the first store's photo automatically. Drag title and subtitle on the canvas to reposition.</p>
                    </div>
                  )}

                  {/* Store slide editor */}
                  {activeMultiSlide?.type === 'store' && activeMultiSlide.store && (
                    <div className="space-y-3">
                      {activeMultiSlide.store.photos.length > 1 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Photo</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {activeMultiSlide.store.photos.map((photo, idx) => (
                              <button key={idx} onClick={() => handleMultiPhotoChange(idx)}
                                className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                                  activeMultiSlide.photoIdx === idx ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-gray-300 hover:border-cyan-300'
                                }`}>
                                <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Caption (optional)</label>
                        <textarea
                          value={activeMultiSlide.caption}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMultiSlides(prev => prev.map((s, i) => i === activeSlide ? { ...s, caption: val } : s));
                          }}
                          placeholder="e.g. Dense archive of 90s Japanese denim…"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => moveSlide(activeSlide, 'up')}
                          disabled={activeSlide <= 1}
                          className="flex-1 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 transition-colors">
                          ↑ Move Up
                        </button>
                        <button onClick={() => moveSlide(activeSlide, 'down')}
                          disabled={activeSlide >= multiSlides.length - 2}
                          className="flex-1 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 transition-colors">
                          ↓ Move Down
                        </button>
                        <button onClick={() => removeSlide(activeSlide)}
                          className="px-3 py-1.5 text-xs font-medium border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors">
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CTA editor */}
                  {activeMultiSlide?.type === 'cta' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">CTA Text</label>
                        <input type="text" value={multiCTAText} onChange={(e) => setMultiCTAText(e.target.value)}
                          placeholder="DISCOVER MORE"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                      </div>
                      <p className="text-xs text-gray-500 italic">Black background with LOST IN TRANSIT branding and @lostintransit.jp handle.</p>
                    </div>
                  )}
                </div>
              )}

              {multiSlides.length === 0 && (
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400 text-sm bg-white">
                  Set your filters above and click <strong className="text-gray-600">Build Slides</strong> to get started.
                </div>
              )}
            </>
          )}

          {/* ── Shared Controls (both modes) ────────────────────────────── */}
          {designElementsPanel}
          {stylingPanel}
          {exportPanel}

        </div>

        {/* ── Right Panel — Canvas ─────────────────────────────────────── */}
        <div className="sticky top-6 self-start">
          {/* Slide dot indicators */}
          <div className="flex justify-center gap-2 mb-3 flex-wrap">
            {slideLabels.map((_, i) => (
              <button key={i} onClick={() => setActiveSlide(i)}
                className={`h-2 rounded-full transition-all ${activeSlide === i ? 'bg-cyan-500 w-6' : 'bg-gray-300 w-2 hover:bg-gray-400'}`} />
            ))}
          </div>

          <div
            className="bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-4 border-gray-700 mx-auto"
            style={{ width: `${CANVAS_W * SCALE}px`, height: `${CANVAS_H * SCALE}px`, position: 'relative' }}
          >
            {carouselMode === 'single' ? (
              /* ══ SINGLE-STORE CANVAS ══════════════════════════════════ */
              <div
                ref={canvasRef}
                className="relative bg-black"
                style={{ width: `${CANVAS_W}px`, height: `${CANVAS_H}px`, transform: `scale(${SCALE})`, transformOrigin: 'top left' }}
              >
                {activeImage && (
                  <img src={activeImage} alt="Store" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" style={{ userSelect: 'none', pointerEvents: 'none' }} />
                )}
                <div className="absolute inset-0 bg-black/20" style={{ pointerEvents: 'none' }} />
                {activeSlide === 0 && showGradient && (
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0) 65%)', pointerEvents: 'none' }} />
                )}
                {activeSlide === 3 && (
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)', pointerEvents: 'none' }} />
                )}

                {sharedCanvasElements}

                {activeSlide === 0 && hook && showHook && (
                  <Draggable position={hookPos} onStop={(_, d) => setHookPos({ x: d.x, y: d.y })} bounds="parent">
                    <div className="absolute cursor-move" style={{ display: 'inline-block', maxWidth: '980px' }}>
                      <div className="font-black" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: `${hookSize}px`, color: hookColor, textShadow: '3px 3px 12px rgba(0,0,0,0.9)', lineHeight: 1.1, whiteSpace: 'pre-wrap', display: 'inline-block', fontStyle: 'italic' }}>
                        {hook}
                      </div>
                    </div>
                  </Draggable>
                )}
                {activeSlide === 1 && caption2 && (
                  <Draggable position={cap2Pos} onStop={(_, d) => setCap2Pos({ x: d.x, y: d.y })} bounds="parent">
                    <div className="absolute cursor-move" style={{ display: 'inline-block', maxWidth: '980px' }}>
                      <div className="font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: `${captionSize}px`, color: captionColor, textShadow: '2px 2px 10px rgba(0,0,0,0.9)', lineHeight: 1.3, whiteSpace: 'pre-wrap', display: 'inline-block' }}>
                        {caption2}
                      </div>
                    </div>
                  </Draggable>
                )}
                {activeSlide === 2 && caption3 && (
                  <Draggable position={cap3Pos} onStop={(_, d) => setCap3Pos({ x: d.x, y: d.y })} bounds="parent">
                    <div className="absolute cursor-move" style={{ display: 'inline-block', maxWidth: '980px' }}>
                      <div className="font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: `${captionSize}px`, color: captionColor, textShadow: '2px 2px 10px rgba(0,0,0,0.9)', lineHeight: 1.3, whiteSpace: 'pre-wrap', display: 'inline-block' }}>
                        {caption3}
                      </div>
                    </div>
                  </Draggable>
                )}
                {activeSlide === 3 && selectedStore?.address && (
                  <Draggable position={addressPos} onStop={(_, d) => setAddressPos({ x: d.x, y: d.y })} bounds="parent">
                    <div className="absolute cursor-move" style={{ display: 'inline-block', maxWidth: '980px' }}>
                      <div className="font-black" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '60px', color: '#FFFFFF', textShadow: '3px 3px 12px rgba(0,0,0,0.9)', lineHeight: 1.25, whiteSpace: 'pre-wrap', display: 'inline-block' }}>
                        {selectedStore.address}
                      </div>
                    </div>
                  </Draggable>
                )}
                {storeName && (
                  <Draggable
                    position={namePosMap[activeSlide] ?? { x: 50, y: 1150 }}
                    onStop={(_, d) => setNamePosMap(prev => ({ ...prev, [activeSlide]: { x: d.x, y: d.y } }))}
                    bounds="parent"
                  >
                    <div className="absolute cursor-move" style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
                      <div className="font-black tracking-tight" style={{ fontSize: `${storeNameSize}px`, color: storeNameColor, fontFamily: 'Plus Jakarta Sans, sans-serif', textShadow: '2px 2px 8px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', display: 'inline-block' }}>
                        {storeName}
                      </div>
                    </div>
                  </Draggable>
                )}
                {location && (
                  <Draggable
                    position={locPosMap[activeSlide] ?? { x: 50, y: 1220 }}
                    onStop={(_, d) => setLocPosMap(prev => ({ ...prev, [activeSlide]: { x: d.x, y: d.y } }))}
                    bounds="parent"
                  >
                    <div className="absolute cursor-move" style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
                      <div className="font-semibold" style={{ fontSize: `${locationSize}px`, color: locationColor, fontFamily: 'Plus Jakarta Sans, sans-serif', textShadow: '2px 2px 6px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', display: 'inline-block' }}>
                        {location}
                      </div>
                    </div>
                  </Draggable>
                )}
                {(showCustomCaption[activeSlide] ?? false) && (customCaptionText[activeSlide] ?? '') && (
                  <Draggable
                    position={customCaptionPosMap[activeSlide] ?? { x: 50, y: 700 }}
                    onStop={(_, d) => setCustomCaptionPosMap(prev => ({ ...prev, [activeSlide]: { x: d.x, y: d.y } }))}
                    bounds="parent"
                  >
                    <div className="absolute cursor-move" style={{ display: 'inline-block', maxWidth: '980px' }}>
                      <div className="font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: `${customCaptionSize[activeSlide] ?? 48}px`, color: customCaptionColor[activeSlide] ?? '#FFFFFF', textShadow: '2px 2px 10px rgba(0,0,0,0.9)', lineHeight: 1.3, whiteSpace: 'pre-wrap', display: 'inline-block' }}>
                        {customCaptionText[activeSlide]}
                      </div>
                    </div>
                  </Draggable>
                )}

                {/* Empty state */}
                {!activeImage && (
                  <div className="absolute inset-0 flex items-center justify-center text-white" style={{ pointerEvents: 'none' }}>
                    <div className="text-center">
                      {isLoadingBg
                        ? <><p className="text-6xl mb-4">⏳</p><p className="text-3xl font-semibold">Loading photo…</p></>
                        : <><p className="text-6xl mb-4">🎞</p><p className="text-3xl font-semibold">Select a store to begin</p><p className="text-xl mt-2 text-gray-500">Slide {activeSlide + 1} of 5</p></>
                      }
                    </div>
                  </div>
                )}
              </div>

            ) : (
              /* ══ MULTI-STORE CANVAS ════════════════════════════════════ */
              <div
                ref={canvasRef}
                className="relative bg-black"
                style={{ width: `${CANVAS_W}px`, height: `${CANVAS_H}px`, transform: `scale(${SCALE})`, transformOrigin: 'top left' }}
              >
                {/* Background image */}
                {activeMultiSlide?.type === 'cover' && coverBgImage && (
                  <img src={coverBgImage} alt="Cover background" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" style={{ userSelect: 'none', pointerEvents: 'none' }} />
                )}
                {activeMultiSlide?.type === 'store' && activeMultiImage && (
                  <img src={activeMultiImage} alt={activeMultiSlide.store?.name ?? 'Store'} crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" style={{ userSelect: 'none', pointerEvents: 'none' }} />
                )}
                {/* CTA: black bg — no image */}

                {/* Base overlay */}
                <div className="absolute inset-0 bg-black/20" style={{ pointerEvents: 'none' }} />

                {/* Bottom gradient for cover + store slides */}
                {(activeMultiSlide?.type === 'cover' || activeMultiSlide?.type === 'store') && (
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
                )}

                {sharedCanvasElements}

                {/* Cover: title + subtitle */}
                {activeMultiSlide?.type === 'cover' && (
                  <>
                    {multiTitle && (
                      <Draggable position={hookPos} onStop={(_, d) => setHookPos({ x: d.x, y: d.y })} bounds="parent">
                        <div className="absolute cursor-move" style={{ display: 'inline-block', maxWidth: '980px' }}>
                          <div className="font-black" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: `${hookSize}px`, color: hookColor, textShadow: '3px 3px 12px rgba(0,0,0,0.9)', lineHeight: 1.1, whiteSpace: 'pre-wrap', display: 'inline-block', fontStyle: 'italic' }}>
                            {multiTitle}
                          </div>
                        </div>
                      </Draggable>
                    )}
                    {multiSubtitle && (
                      <Draggable
                        position={multiLocPosMap[0] ?? { x: 50, y: 1220 }}
                        onStop={(_, d) => setMultiLocPosMap(prev => ({ ...prev, [0]: { x: d.x, y: d.y } }))}
                        bounds="parent"
                      >
                        <div className="absolute cursor-move" style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
                          <div className="font-semibold" style={{ fontSize: `${locationSize}px`, color: locationColor, fontFamily: 'Plus Jakarta Sans, sans-serif', textShadow: '2px 2px 6px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', display: 'inline-block' }}>
                            {multiSubtitle}
                          </div>
                        </div>
                      </Draggable>
                    )}
                  </>
                )}

                {/* Store slide: name + location + caption */}
                {activeMultiSlide?.type === 'store' && activeMultiSlide.store && (
                  <>
                    <Draggable
                      position={multiNamePosMap[activeSlide] ?? { x: 50, y: 1150 }}
                      onStop={(_, d) => setMultiNamePosMap(prev => ({ ...prev, [activeSlide]: { x: d.x, y: d.y } }))}
                      bounds="parent"
                    >
                      <div className="absolute cursor-move" style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
                        <div className="font-black tracking-tight" style={{ fontSize: `${storeNameSize}px`, color: storeNameColor, fontFamily: 'Plus Jakarta Sans, sans-serif', textShadow: '2px 2px 8px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', display: 'inline-block' }}>
                          {activeMultiSlide.store.name}
                        </div>
                      </div>
                    </Draggable>
                    <Draggable
                      position={multiLocPosMap[activeSlide] ?? { x: 50, y: 1220 }}
                      onStop={(_, d) => setMultiLocPosMap(prev => ({ ...prev, [activeSlide]: { x: d.x, y: d.y } }))}
                      bounds="parent"
                    >
                      <div className="absolute cursor-move" style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
                        <div className="font-semibold" style={{ fontSize: `${locationSize}px`, color: locationColor, fontFamily: 'Plus Jakarta Sans, sans-serif', textShadow: '2px 2px 6px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', display: 'inline-block' }}>
                          {activeMultiSlide.store.city}{activeMultiSlide.store.neighborhood ? ` • ${activeMultiSlide.store.neighborhood}` : ''}
                        </div>
                      </div>
                    </Draggable>
                    {activeMultiSlide.caption && (
                      <Draggable
                        position={multiCaptionPosMap[activeSlide] ?? { x: 50, y: 400 }}
                        onStop={(_, d) => setMultiCaptionPosMap(prev => ({ ...prev, [activeSlide]: { x: d.x, y: d.y } }))}
                        bounds="parent"
                      >
                        <div className="absolute cursor-move" style={{ display: 'inline-block', maxWidth: '980px' }}>
                          <div className="font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: `${captionSize}px`, color: captionColor, textShadow: '2px 2px 10px rgba(0,0,0,0.9)', lineHeight: 1.3, whiteSpace: 'pre-wrap', display: 'inline-block' }}>
                            {activeMultiSlide.caption}
                          </div>
                        </div>
                      </Draggable>
                    )}
                    {/* Loading spinner overlay */}
                    {isLoadingMultiBg && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
                        <p className="text-white text-6xl">⏳</p>
                      </div>
                    )}
                  </>
                )}

                {/* CTA slide */}
                {activeMultiSlide?.type === 'cta' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6" style={{ pointerEvents: 'none' }}>
                    <div className="font-black" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '96px', color: '#00D9FF', textShadow: '3px 3px 20px rgba(0,217,255,0.35)', lineHeight: 1, fontStyle: 'italic', textAlign: 'center', paddingLeft: '60px', paddingRight: '60px' }}>
                      {multiCTAText || 'DISCOVER MORE'}
                    </div>
                    <div className="font-black tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '42px', color: '#FFFFFF', textShadow: '2px 2px 8px rgba(0,0,0,0.8)', textAlign: 'center' }}>
                      LOST IN TRANSIT
                    </div>
                    <div className="font-semibold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '28px', color: '#AAAAAA', textAlign: 'center' }}>
                      @lostintransit.jp
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {multiSlides.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-white" style={{ pointerEvents: 'none' }}>
                    <div className="text-center">
                      <p className="text-6xl mb-4">🎞</p>
                      <p className="text-3xl font-semibold">Build slides to preview</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Slide label */}
          <p className="text-center text-sm text-gray-500 mt-2 font-medium">
            {slideLabels[activeSlide] ?? `Slide ${activeSlide + 1}`}
          </p>
        </div>

      </div>
    </div>
  );
}
