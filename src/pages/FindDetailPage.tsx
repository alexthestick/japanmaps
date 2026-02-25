import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, ShoppingBag, ArrowLeft, Send, X,
  MessageCircle, Clock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { extractFindShortId, getDisplayUsername } from '../utils/slugify';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FindDetail {
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
  status: string;
  created_at: string;
  profiles: {
    username: string | null;
    display_name: string | null;
  } | null;
}

interface Comment {
  id: string;
  find_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles: {
    username: string | null;
    display_name: string | null;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#22d9ee', '#a855f7', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];
function avatarColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (days === 0) return `${Math.floor(mins / 60)}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// ─── Comment component ─────────────────────────────────────────────────────────

function CommentItem({ comment, currentUserId, onDelete }: {
  comment: Comment;
  currentUserId: string | undefined;
  onDelete: (id: string) => void;
}) {
  const username = getDisplayUsername(comment.profiles, comment.user_id);
  const color = avatarColor(username);
  const initials = username.slice(0, 2).toUpperCase();
  const isOwn = currentUserId === comment.user_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex gap-3 group"
    >
      {/* Avatar */}
      <div
        className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
        style={{ backgroundColor: `${color}25`, border: `1.5px solid ${color}50`, color }}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-white text-sm font-semibold">@{username}</span>
          <span className="text-gray-600 text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(comment.created_at)}
          </span>
          {isOwn && (
            <button
              onClick={() => onDelete(comment.id)}
              className="ml-auto opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
              title="Delete comment"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-gray-300 text-sm mt-0.5 leading-relaxed">{comment.body}</p>
      </div>
    </motion.div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function FindDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuthContext();
  const navigate = useNavigate();

  const [find, setFind] = useState<FindDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingFind, setLoadingFind] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Fetch find — supports both slug format (item-store-city--shortid) and plain UUID
  useEffect(() => {
    if (!id) return;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isPlainUUID = uuidRegex.test(id);

    if (isPlainUUID) {
      // Legacy plain UUID URL
      supabase
        .from('field_notes')
        .select('*, profiles(username, display_name)')
        .eq('id', id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) setNotFound(true);
          else setFind(data as FindDetail);
          setLoadingFind(false);
        });
    } else {
      // Slug format: extract short ID (first 8 hex chars after --)
      const shortId = extractFindShortId(id);
      if (!shortId) { setNotFound(true); setLoadingFind(false); return; }

      // Fetch all finds and match client-side by UUID prefix
      supabase
        .from('field_notes')
        .select('*, profiles(username, display_name)')
        .order('created_at', { ascending: false })
        .then(({ data: allData }) => {
          const match = (allData || []).find((f: any) => f.id.startsWith(shortId));
          if (!match) setNotFound(true);
          else setFind(match as FindDetail);
          setLoadingFind(false);
        });
    }
  }, [id]);

  // Fetch comments once we have the real find ID
  useEffect(() => {
    if (!find) return;
    supabase
      .from('find_comments')
      .select('*, profiles(username, display_name)')
      .eq('find_id', find.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setComments((data as Comment[]) || []);
        setLoadingComments(false);
      });
  }, [find]);

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !commentBody.trim() || !find) return;

    setSubmittingComment(true);
    const { data, error } = await supabase
      .from('find_comments')
      .insert({
        find_id: find.id,
        user_id: user.id,
        body: commentBody.trim(),
      })
      .select('*, profiles(username, display_name)')
      .single();

    if (!error && data) {
      setComments(prev => [...prev, data as Comment]);
      setCommentBody('');
    }
    setSubmittingComment(false);
  }

  async function handleDeleteComment(commentId: string) {
    const { error } = await supabase
      .from('find_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user!.id);

    if (!error) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  }

  if (loadingFind) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-purple-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound || !find) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-lg">Find not found.</p>
        <Link to="/finds" className="text-purple-400 hover:text-purple-300 text-sm">
          ← Back to Finds
        </Link>
      </div>
    );
  }

  const isVisit = find.type === 'visit';
  const typeColor = isVisit ? '#22d9ee' : '#a855f7';
  const TypeIcon = isVisit ? MapPin : ShoppingBag;
  const typeLabel = isVisit ? 'VISITED' : 'PICKED UP';

  const username = getDisplayUsername(find.profiles, find.user_id);
  const color = avatarColor(username);
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-black">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-purple-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-cyan-500/4 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-8">

        {/* Back nav */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Find card */}
        <div
          className="rounded-2xl overflow-hidden bg-gray-900 border"
          style={{ borderColor: `${typeColor}25` }}
        >
          {/* Photo */}
          {find.photo_url && (
            <div className="relative w-full">
              <img
                src={find.photo_url}
                alt={find.store_name}
                className="w-full h-auto block"
                style={{ maxHeight: '80vh', objectFit: 'contain', backgroundColor: '#0a0a0a' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Type badge */}
              <div
                className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-sm"
                style={{ backgroundColor: `${typeColor}25`, border: `1px solid ${typeColor}60`, color: typeColor }}
              >
                <TypeIcon className="h-3.5 w-3.5" />
                {typeLabel}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* No-photo badge */}
            {!find.photo_url && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4"
                style={{ backgroundColor: `${typeColor}20`, border: `1px solid ${typeColor}60`, color: typeColor }}
              >
                <TypeIcon className="h-3.5 w-3.5" />
                {typeLabel}
              </div>
            )}

            {/* User + time */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                style={{ backgroundColor: `${color}25`, border: `1.5px solid ${color}50`, color }}
              >
                {initials}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">@{username}</p>
                <p className="text-gray-500 text-xs">{timeAgo(find.created_at)}</p>
              </div>
            </div>

            {/* Store + location */}
            <h1 className="text-2xl font-black text-white mb-1">{find.store_name}</h1>
            {(find.neighborhood || find.city) && (
              <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
                <MapPin className="h-3.5 w-3.5" />
                {find.neighborhood ? `${find.neighborhood}, ` : ''}{find.city}
              </p>
            )}

            {/* Item name */}
            {find.item_name && (
              <div
                className="inline-block px-3 py-1.5 rounded-full text-sm font-semibold mb-4"
                style={{ backgroundColor: `${typeColor}15`, color: typeColor, border: `1px solid ${typeColor}30` }}
              >
                {find.item_name}
              </div>
            )}

            {/* Caption */}
            {find.caption && (
              <p className="text-gray-300 text-base leading-relaxed mb-4">
                {find.caption}
              </p>
            )}

            {/* Link to store */}
            {find.store_id && (
              <Link
                to={`/store/${find.store_id}`}
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors mt-2"
                style={{ color: typeColor }}
              >
                <MapPin className="h-4 w-4" />
                View store on map
              </Link>
            )}
          </div>
        </div>

        {/* Comments section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="h-5 w-5 text-gray-500" />
            <h2 className="text-white font-bold text-lg">
              Comments
              {comments.length > 0 && (
                <span className="text-gray-500 font-normal text-base ml-2">({comments.length})</span>
              )}
            </h2>
          </div>

          {/* Comment list */}
          {loadingComments ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-16 rounded-xl bg-gray-900 animate-pulse" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              <MessageCircle className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No comments yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-5">
              <AnimatePresence>
                {comments.map(comment => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={user?.id}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Comment input */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            {user ? (
              <form onSubmit={handleAddComment} className="flex gap-3">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
                  style={{
                    backgroundColor: `${avatarColor(profile?.username || user.email?.split('@')[0] || '')}25`,
                    border: `1.5px solid ${avatarColor(profile?.username || user.email?.split('@')[0] || '')}50`,
                    color: avatarColor(profile?.username || user.email?.split('@')[0] || ''),
                  }}
                >
                  {(profile?.username || user.email?.split('@')[0] || '').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={commentBody}
                    onChange={e => setCommentBody(e.target.value)}
                    placeholder="Add a comment..."
                    maxLength={500}
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentBody.trim()}
                    className="flex items-center justify-center h-10 w-10 rounded-xl transition-all disabled:opacity-40 flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(168,85,247,0.15))',
                      border: '1px solid rgba(168,85,247,0.4)',
                      color: '#a855f7',
                    }}
                  >
                    {submittingComment ? (
                      <span className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-3">Sign in to leave a comment</p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-colors"
                  style={{
                    background: 'rgba(168,85,247,0.1)',
                    border: '1px solid rgba(168,85,247,0.3)',
                    color: '#a855f7',
                  }}
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
