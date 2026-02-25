import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Bookmark, Camera, LogOut, Edit3, Check, X,
  ShoppingBag, ChevronRight, Trash2,
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { RequireAuth } from '../components/common/RequireAuth';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SavedStore {
  store_id: string;
  created_at: string;
  stores: {
    id: string;
    name: string;
    city: string;
    neighborhood: string | null;
    photos: string[];
    categories: string[];
  } | null;
}

interface UserFind {
  id: string;
  type: 'visit' | 'haul';
  store_name: string;
  neighborhood: string | null;
  city: string;
  item_name: string | null;
  caption: string | null;
  photo_url: string | null;
  status: string;
  created_at: string;
}

// ─── Avatar ────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#22d9ee', '#a855f7', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#f97316',
];

function getAvatarColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Saved store card ──────────────────────────────────────────────────────────

function SavedStoreCard({ item }: { item: SavedStore }) {
  if (!item.stores) return null;
  const store = item.stores;
  const photo = store.photos?.[0];

  return (
    <Link
      to={`/store/${store.id}`}
      className="group flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-cyan-500/40 transition-all duration-200"
    >
      <div className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
        {photo ? (
          <img src={photo} alt={store.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Bookmark className="h-6 w-6 text-gray-600" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{store.name}</p>
        <p className="text-gray-500 text-sm">{store.neighborhood || store.city}</p>
        {store.categories?.[0] && (
          <span className="inline-block mt-1 text-xs text-cyan-400/70 bg-cyan-500/10 px-2 py-0.5 rounded-full">
            {store.categories[0]}
          </span>
        )}
      </div>
      <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

// ─── Find card ─────────────────────────────────────────────────────────────────

function FindCard({
  note,
  onDelete,
  onEdit,
}: {
  note: UserFind;
  onDelete: (id: string) => void;
  onEdit: (id: string, caption: string, itemName: string) => Promise<void>;
}) {
  const isVisit = note.type === 'visit';
  const typeColor = isVisit ? '#22d9ee' : '#a855f7';
  const canEdit = note.status === 'pending';

  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(note.caption || '');
  const [itemName, setItemName] = useState(note.item_name || '');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onEdit(note.id, caption, itemName);
    setSaving(false);
    setEditing(false);
  }

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div
          className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: `${typeColor}15`, border: `1px solid ${typeColor}30` }}
        >
          {note.photo_url ? (
            <img src={note.photo_url} alt="" className="h-full w-full object-cover" />
          ) : isVisit ? (
            <MapPin className="h-6 w-6" style={{ color: typeColor }} />
          ) : (
            <ShoppingBag className="h-6 w-6" style={{ color: typeColor }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: typeColor }}>
              {isVisit ? 'Visited' : 'Picked up'}
            </span>
            {note.status === 'pending' && (
              <span className="text-xs text-yellow-500/70 bg-yellow-500/10 px-2 py-0.5 rounded-full">Pending review</span>
            )}
            {note.status === 'approved' && (
              <span className="text-xs text-green-500/70 bg-green-500/10 px-2 py-0.5 rounded-full">Approved</span>
            )}
            {note.status === 'rejected' && (
              <span className="text-xs text-red-500/70 bg-red-500/10 px-2 py-0.5 rounded-full">Rejected</span>
            )}
          </div>
          <p className="text-white font-medium truncate">{note.store_name}</p>
          {note.item_name && <p className="text-gray-400 text-sm truncate">{note.item_name}</p>}
          {note.caption && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{note.caption}</p>}
          <p className="text-gray-600 text-xs mt-1">
            {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {canEdit && (
            <button
              onClick={() => setEditing(e => !e)}
              className="p-1.5 rounded-lg text-gray-600 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
              title="Edit find"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          )}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Delete find"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => onDelete(note.id)}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                title="Confirm delete"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-700 transition-all"
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline edit form (pending only) */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-800"
          >
            <div className="p-4 space-y-3">
              {note.type === 'haul' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Item name</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={e => setItemName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="What did you pick up?"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Caption</label>
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  maxLength={280}
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none transition-colors"
                  placeholder="Add a caption..."
                />
                <p className="text-gray-600 text-xs mt-0.5 text-right">{caption.length}/280</p>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setCaption(note.caption || ''); setItemName(note.item_name || ''); setEditing(false); }}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-medium rounded-lg transition-colors"
                >
                  {saving ? <span className="animate-spin h-3 w-3 border border-black/30 border-t-black rounded-full" /> : <Check className="h-3.5 w-3.5" />}
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Bio editor ────────────────────────────────────────────────────────────────

function BioEditor({ bio, onSave }: { bio: string | null; onSave: (val: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(bio || '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(value);
    setSaving(false);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="group flex items-start gap-2 cursor-pointer" onClick={() => setEditing(true)}>
        <p className={`flex-1 text-sm leading-relaxed ${bio ? 'text-gray-400' : 'italic text-gray-600'}`}>
          {bio || 'Add a bio...'}
        </p>
        <Edit3 className="h-4 w-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0 mt-0.5 transition-colors" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        maxLength={160}
        rows={3}
        autoFocus
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none"
        placeholder="Tell the community about yourself..."
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">{value.length}/160</span>
        <div className="flex gap-2">
          <button
            onClick={() => { setValue(bio || ''); setEditing(false); }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-medium rounded-lg transition-colors"
          >
            {saving ? <span className="animate-spin h-3 w-3 border border-black/30 border-t-black rounded-full" /> : <Check className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Username editor ───────────────────────────────────────────────────────────

function UsernameEditor({ username, onSave }: { username: string; onSave: (val: string) => Promise<string | null> }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(username);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function validate(v: string): string | null {
    if (v.length < 3) return 'At least 3 characters required.';
    if (v.length > 30) return 'Max 30 characters.';
    if (!/^[a-z0-9_]+$/.test(v)) return 'Only lowercase letters, numbers, and underscores.';
    return null;
  }

  async function handleSave() {
    const err = validate(value);
    if (err) { setError(err); return; }
    setSaving(true);
    setError('');
    const saveError = await onSave(value);
    setSaving(false);
    if (saveError) { setError(saveError); return; }
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="group flex items-center gap-2 cursor-pointer w-fit" onClick={() => { setValue(username); setEditing(true); }}>
        <h1 className="text-2xl font-bold text-white">@{username}</h1>
        <Edit3 className="h-4 w-4 text-gray-600 group-hover:text-gray-400 transition-colors mt-0.5" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-xl font-bold">@</span>
        <input
          type="text"
          value={value}
          onChange={e => { setValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')); setError(''); }}
          maxLength={30}
          autoFocus
          className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-white text-lg font-bold focus:outline-none focus:border-cyan-500 transition-colors w-48"
          placeholder="your_username"
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setValue(username); setEditing(false); setError(''); }}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || value === username}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-medium rounded-lg transition-colors"
        >
          {saving ? <span className="animate-spin h-3 w-3 border border-black/30 border-t-black rounded-full" /> : <Check className="h-4 w-4" />}
          Save
        </button>
      </div>
    </div>
  );
}

// ─── Main profile content ──────────────────────────────────────────────────────

type Tab = 'saved' | 'finds';

function ProfileContent() {
  const { user, profile, signOut, refreshProfile } = useAuthContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const [savedStores, setSavedStores] = useState<SavedStore[]>([]);
  const [finds, setFinds] = useState<UserFind[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [loadingFinds, setLoadingFinds] = useState(true);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoFileRef = useRef<HTMLInputElement>(null);
  const [approvalBanners, setApprovalBanners] = useState<{ id: string; store_name: string }[]>([]);

  const username = profile?.username || profile?.display_name || user?.email?.split('@')[0] || 'User';
  const avatarColor = getAvatarColor(username);
  const initials = username.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!user) return;
    supabase
      .from('saved_stores')
      .select('store_id, created_at, stores(id, name, city, neighborhood, photos, categories)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSavedStores((data as SavedStore[]) || []);
        setLoadingSaved(false);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('field_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const allFinds = (data as UserFind[]) || [];
        setFinds(allFinds);
        setLoadingFinds(false);

        // Check for newly approved finds the user hasn't been notified about
        const dismissedKey = `lit_approval_dismissed_${user.id}`;
        const lastDismissed = parseInt(localStorage.getItem(dismissedKey) || '0', 10);
        const newlyApproved = allFinds.filter(f =>
          f.status === 'approved' &&
          new Date(f.created_at).getTime() > lastDismissed
        );
        if (newlyApproved.length > 0) {
          setApprovalBanners(newlyApproved.map(f => ({ id: f.id, store_name: f.store_name })));
        }
      });
  }, [user]);

  async function handleFindDelete(id: string) {
    await supabase.from('field_notes').delete().eq('id', id).eq('user_id', user!.id);
    setFinds(prev => prev.filter(f => f.id !== id));
  }

  async function handleFindEdit(id: string, caption: string, itemName: string) {
    const { data } = await supabase
      .from('field_notes')
      .update({ caption: caption.trim() || null, item_name: itemName.trim() || null })
      .eq('id', id)
      .eq('user_id', user!.id)
      .select()
      .single();
    if (data) setFinds(prev => prev.map(f => f.id === id ? { ...f, caption: data.caption, item_name: data.item_name } : f));
  }

  async function handleBioSave(bio: string) {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({ bio, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    await refreshProfile();
  }

  // Returns null on success, or an error string to display
  async function handleUsernameSave(newUsername: string): Promise<string | null> {
    if (!user) return 'Not logged in.';
    // Check availability
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', newUsername)
      .neq('id', user.id)
      .maybeSingle();
    if (existing) return 'Username already taken.';
    const { error } = await supabase
      .from('profiles')
      .update({ username: newUsername, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) return 'Failed to update username. Please try again.';
    await refreshProfile();
    return null;
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setPhotoUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(path, file, { contentType: file.type, upsert: true });
    if (uploadError) { setPhotoUploading(false); return; }
    const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(path);
    // Bust cache by appending timestamp
    const photo_url = `${urlData.publicUrl}?t=${Date.now()}`;
    await supabase
      .from('profiles')
      .update({ profile_photo: photo_url, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    await refreshProfile();
    setPhotoUploading(false);
    // Reset file input so re-uploading same file works
    if (photoFileRef.current) photoFileRef.current.value = '';
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm mb-8 transition-colors"
        >
          <MapPin className="h-4 w-4" />
          Lost in Transit
        </Link>

        {/* Approval banners */}
        <AnimatePresence>
          {approvalBanners.map(banner => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between gap-4 mb-4 px-5 py-3.5 rounded-xl border border-green-500/30 bg-green-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-400 shrink-0" />
                <p className="text-green-300 text-sm font-medium">
                  Your find at <span className="text-white font-bold">{banner.store_name}</span> was approved!
                </p>
              </div>
              <button
                onClick={() => {
                  setApprovalBanners(prev => prev.filter(b => b.id !== banner.id));
                  localStorage.setItem(`lit_approval_dismissed_${user!.id}`, Date.now().toString());
                }}
                className="text-green-500/60 hover:text-green-300 transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Profile header */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-start gap-5">
            {/* Avatar — click to upload */}
            <div className="relative flex-shrink-0 group">
              <div
                className="h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg overflow-hidden cursor-pointer"
                style={{
                  backgroundColor: `${avatarColor}20`,
                  border: `2px solid ${avatarColor}40`,
                  color: avatarColor,
                  boxShadow: `0 0 20px ${avatarColor}20`,
                }}
                onClick={() => photoFileRef.current?.click()}
              >
                {profile?.profile_photo ? (
                  <img src={profile.profile_photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
                {/* Upload overlay */}
                <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {photoUploading ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                </div>
              </div>
              <input
                ref={photoFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <UsernameEditor username={username} onSave={handleUsernameSave} />
                  <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-red-400 text-sm transition-colors flex-shrink-0"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>

              <div className="mt-4">
                <BioEditor bio={profile?.bio || null} onSave={handleBioSave} />
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-5">
                <div className="text-center">
                  <p className="text-white font-bold text-xl">{savedStores.length}</p>
                  <p className="text-gray-500 text-xs">Saved</p>
                </div>
                <div className="h-8 w-px bg-gray-800" />
                <div className="text-center">
                  <p className="text-white font-bold text-xl">{finds.filter(n => n.type === 'visit').length}</p>
                  <p className="text-gray-500 text-xs">Visits</p>
                </div>
                <div className="h-8 w-px bg-gray-800" />
                <div className="text-center">
                  <p className="text-white font-bold text-xl">{finds.filter(n => n.type === 'haul').length}</p>
                  <p className="text-gray-500 text-xs">Finds</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-900 rounded-xl mb-6 border border-gray-800">
          {([
            { id: 'saved' as const, label: 'Saved Stores', icon: Bookmark },
            { id: 'finds' as const, label: 'My Finds', icon: Camera },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'saved' ? (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {loadingSaved ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 rounded-xl bg-gray-900 animate-pulse" />
                  ))}
                </div>
              ) : savedStores.length === 0 ? (
                <div className="text-center py-16">
                  <Bookmark className="h-10 w-10 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No saved stores yet</p>
                  <p className="text-gray-600 text-sm mt-1">Browse the map and save stores you want to visit</p>
                  <Link
                    to="/map"
                    className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-medium transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                    Explore stores
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedStores.map(item => (
                    <SavedStoreCard key={item.store_id} item={item} />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="finds"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {loadingFinds ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 rounded-xl bg-gray-900 animate-pulse" />
                  ))}
                </div>
              ) : finds.length === 0 ? (
                <div className="text-center py-16">
                  <Camera className="h-10 w-10 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No finds yet</p>
                  <p className="text-gray-600 text-sm mt-1">Share your visits and pickups from stores in Japan</p>
                  <Link
                    to="/finds"
                    className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl text-sm font-medium transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    Browse Finds
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {finds.map(note => (
                    <FindCard key={note.id} note={note} onDelete={handleFindDelete} onEdit={handleFindEdit} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Wrap with RequireAuth guard
export function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
