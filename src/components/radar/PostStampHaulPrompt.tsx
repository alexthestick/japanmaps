/**
 * PostStampHaulPrompt
 *
 * Soft invitation card shown after a successful Radar stamp.
 * Slides up after the check-in card auto-dismisses.
 *
 * UX principles:
 *   - Photo-first, not form-first. Camera button is the primary action.
 *   - Store name + neighborhood pre-populated — zero friction.
 *   - One-tap anywhere on the dismiss bar closes it. No guilt if skipped.
 *   - On submit: writes a 'haul' row to field_notes (same table as manual finds,
 *     but the store_id is set so it's GPS-linked — higher trust tier).
 *
 * Props:
 *   store    — the store that was just stamped
 *   onClose  — called on dismiss or after successful submit
 */

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, ImagePlus, X, Check, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';
import type { Store } from '../../types/store';

interface PostStampHaulPromptProps {
  store: Store;
  onClose: () => void;
}

export function PostStampHaulPrompt({ store, onClose }: PostStampHaulPromptProps) {
  const { user } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto]         = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [itemName, setItemName]   = useState('');
  const [caption, setCaption]     = useState('');
  const [expanded, setExpanded]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  // ── Photo selection ───────────────────────────────────────────────────────
  const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setExpanded(true); // expand the form once a photo is chosen
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!user || submitting) return;
    setSubmitting(true);

    let photoUrl: string | null = null;

    // Upload photo to Supabase Storage if one was selected
    if (photo) {
      const ext = photo.name.split('.').pop() ?? 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('field-note-photos')
        .upload(path, photo, { contentType: photo.type, upsert: false });

      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from('field-note-photos')
          .getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }
    }

    // Insert into field_notes
    await supabase.from('field_notes').insert({
      user_id:      user.id,
      type:         'haul',
      store_id:     store.id,
      store_name:   store.name,
      neighborhood: store.neighborhood ?? null,
      city:         store.city,
      photo_url:    photoUrl,
      item_name:    itemName.trim() || null,
      caption:      caption.trim() || null,
      status:       'pending',
    });

    setSubmitting(false);
    setSubmitted(true);

    // Close after brief success moment
    setTimeout(onClose, 1800);
  }, [user, photo, itemName, caption, store, submitting, onClose]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 280, delay: 0.1 }}
      className="absolute left-4 right-4 z-[35] overflow-hidden rounded-2xl backdrop-blur-md"
      style={{
        bottom: 'calc(9.5rem + env(safe-area-inset-bottom, 0px))',
        backgroundColor: 'rgba(10, 10, 15, 0.95)',
        border: '1.5px solid rgba(168,85,247,0.4)',
        boxShadow: '0 0 28px rgba(168,85,247,0.12), 0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      {/* ── Success state ─────────────────────────────────────────────────── */}
      {submitted ? (
        <div className="flex items-center gap-3 px-5 py-4">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)' }}
          >
            <Check className="w-4 h-4" style={{ color: '#a855f7' }} />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Find logged!</p>
            <p className="text-xs" style={{ color: 'rgba(168,85,247,0.7)' }}>Pending community review</p>
          </div>
        </div>
      ) : (
        <>
          {/* ── Header row ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}
            >
              <ShoppingBag className="w-4 h-4" style={{ color: '#a855f7' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold leading-tight">Add a photo or note</p>
              <p className="text-xs truncate" style={{ color: 'rgba(168,85,247,0.6)' }}>
                {store.name}{store.neighborhood ? ` · ${store.neighborhood}` : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full flex-shrink-0 active:scale-90 transition-transform"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              aria-label="Dismiss"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>

          {/* ── Separator ────────────────────────────────────────────────── */}
          <div className="mx-4" style={{ height: 1, backgroundColor: 'rgba(168,85,247,0.12)' }} />

          {/* ── Main action area ─────────────────────────────────────────── */}
          <div className="px-4 pb-4 pt-3 space-y-3">

            {/* Note input — always visible, primary action */}
            {!expanded && (
              <input
                type="text"
                value={caption}
                onChange={e => { setCaption(e.target.value); if (e.target.value) setExpanded(true); }}
                maxLength={280}
                placeholder="Add a photo or note about your find…"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(168,85,247,0.25)',
                }}
              />
            )}

            {/* Photo preview */}
            {photoPreview && (
              <div className="relative w-full h-36 rounded-xl overflow-hidden">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            )}

            {/* Camera + Gallery buttons — shown when no photo selected yet */}
            {!photoPreview && (
              <div className="flex gap-2">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: 'rgba(168,85,247,0.08)',
                    border: '1px solid rgba(168,85,247,0.25)',
                  }}
                >
                  <Camera className="w-4 h-4" style={{ color: 'rgba(168,85,247,0.7)' }} />
                  <span className="text-xs font-medium" style={{ color: 'rgba(168,85,247,0.8)' }}>Camera</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: 'rgba(168,85,247,0.08)',
                    border: '1px solid rgba(168,85,247,0.25)',
                  }}
                >
                  <ImagePlus className="w-4 h-4" style={{ color: 'rgba(168,85,247,0.7)' }} />
                  <span className="text-xs font-medium" style={{ color: 'rgba(168,85,247,0.8)' }}>Gallery</span>
                </button>
              </div>
            )}

            {/* Hidden file inputs — camera forces capture, gallery allows library */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            {/* Expanded fields — item name + caption (full textarea) */}
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-2"
              >
                <input
                  type="text"
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  maxLength={80}
                  placeholder="What did you pick up? (optional)"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(168,85,247,0.25)',
                  }}
                />
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  maxLength={280}
                  rows={2}
                  placeholder="Say something… (optional)"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none resize-none transition-colors"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(168,85,247,0.25)',
                  }}
                />
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              {!expanded && (
                <button
                  onClick={() => setExpanded(true)}
                  className="flex-1 py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: 'rgba(168,85,247,0.08)',
                    border: '1px solid rgba(168,85,247,0.25)',
                    color: 'rgba(168,85,247,0.8)',
                  }}
                >
                  More fields
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={submitting || (!photo && !itemName.trim() && !caption.trim())}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-default flex items-center justify-center gap-2"
                style={{
                  backgroundColor: photo ? '#a855f7' : 'rgba(168,85,247,0.15)',
                  color: photo ? '#fff' : 'rgba(168,85,247,0.6)',
                  border: photo ? '1px solid rgba(168,85,247,0.8)' : '1px solid rgba(168,85,247,0.25)',
                }}
              >
                {submitting
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Log find →'
                }
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
