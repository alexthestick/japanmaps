import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  profile_photo: string | null;
  bio: string | null;
  city: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Cache helpers ────────────────────────────────────────────────────────────

const ADMIN_CACHE_KEY = 'lit_admin_status';

function getCachedAdminStatus(userId: string): boolean | null {
  try {
    const cached = sessionStorage.getItem(ADMIN_CACHE_KEY);
    if (cached) {
      const { id, isAdmin, timestamp } = JSON.parse(cached);
      if (id === userId && Date.now() - timestamp < 3_600_000) return isAdmin;
    }
  } catch {}
  return null;
}

function setCachedAdminStatus(userId: string, isAdmin: boolean) {
  try {
    sessionStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify({ id: userId, isAdmin, timestamp: Date.now() }));
  } catch {}
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const lastFetchedId = useRef<string | null>(null);
  const fetchingRef = useRef(false);

  async function fetchProfile(userId: string) {
    if (fetchingRef.current || lastFetchedId.current === userId) return;

    // Check admin cache to avoid extra roundtrip
    const cachedAdmin = getCachedAdminStatus(userId);

    try {
      fetchingRef.current = true;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // Profile may not exist yet (race with trigger)
        setProfile(null);
        setIsAdmin(cachedAdmin ?? false);
        return;
      }

      setProfile(data as UserProfile);
      const adminStatus = data.is_admin ?? false;
      setIsAdmin(adminStatus);
      setCachedAdminStatus(userId, adminStatus);
      lastFetchedId.current = userId;
    } catch (err) {
      console.error('fetchProfile error:', err);
    } finally {
      fetchingRef.current = false;
    }
  }

  async function refreshProfile() {
    if (user) {
      lastFetchedId.current = null; // force re-fetch
      await fetchProfile(user.id);
    }
  }

  useEffect(() => {
    // Hard timeout — should never be needed, just a last-resort safety net
    const timeout = setTimeout(() => {
      console.warn('[Auth] Session fetch timed out');
      setLoading(false);
    }, 8000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      const u = session?.user ?? null;
      setUser(u);
      // Unblock the UI immediately — profile loads in the background
      setLoading(false);
      // Fetch profile non-blocking
      if (u) fetchProfile(u.id);
    }).catch(() => {
      clearTimeout(timeout);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          // Non-blocking — profile will populate once ready
          fetchProfile(u.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
          lastFetchedId.current = null;
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── Auth methods ───────────────────────────────────────────────────────────

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signUp(email: string, password: string, username: string) {
    // 1. Check username availability first
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (existing) {
      return { error: new Error('Username already taken. Please choose another.') };
    }

    // 2. Create auth user
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) return { error };

    // 3. Create profile directly (no trigger dependency)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username: username.toLowerCase(),
        display_name: username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.warn('[Auth] Could not create profile:', profileError.message);
    }

    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setIsAdmin(false);
    lastFetchedId.current = null;
    try { sessionStorage.removeItem(ADMIN_CACHE_KEY); } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
