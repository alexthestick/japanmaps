import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

// Session storage key for caching admin status
const ADMIN_CACHE_KEY = 'lit_admin_status';

// Cache admin status in sessionStorage to avoid repeated DB queries
function getCachedAdminStatus(userId: string): boolean | null {
  try {
    const cached = sessionStorage.getItem(ADMIN_CACHE_KEY);
    if (cached) {
      const { id, isAdmin, timestamp } = JSON.parse(cached);
      // Cache valid for 1 hour
      if (id === userId && Date.now() - timestamp < 3600000) {
        return isAdmin;
      }
    }
  } catch {}
  return null;
}

function setCachedAdminStatus(userId: string, isAdmin: boolean) {
  try {
    sessionStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify({
      id: userId,
      isAdmin,
      timestamp: Date.now(),
    }));
  } catch {}
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Track the last checked user ID to prevent duplicate admin checks
  const lastCheckedUserId = useRef<string | null>(null);
  const isCheckingRef = useRef(false);

  // Check if user is admin
  async function checkAdminStatus(userId: string) {
    // Skip if we're already checking or already checked this user
    if (isCheckingRef.current || lastCheckedUserId.current === userId) {
      setCheckingAdmin(false);
      return;
    }

    // Check cache first
    const cachedStatus = getCachedAdminStatus(userId);
    if (cachedStatus !== null) {
      setIsAdmin(cachedStatus);
      setCheckingAdmin(false);
      lastCheckedUserId.current = userId;
      return;
    }

    try {
      isCheckingRef.current = true;
      setCheckingAdmin(true);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single()
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setCachedAdminStatus(userId, false);
        lastCheckedUserId.current = userId;
        return;
      }

      const adminStatus = data?.is_admin ?? false;
      setIsAdmin(adminStatus);
      setCachedAdminStatus(userId, adminStatus);
      lastCheckedUserId.current = userId;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
      isCheckingRef.current = false;
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkAdminStatus(session.user.id);
      } else {
        setCheckingAdmin(false);
      }
      setLoading(false);
    });

    // Listen for auth changes - only react to actual changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only process actual auth changes, not visibility events
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        const newUser = session?.user ?? null;

        // Only update if user actually changed
        if (newUser?.id !== user?.id) {
          setUser(newUser);

          if (newUser) {
            await checkAdminStatus(newUser.id);
          } else {
            setIsAdmin(false);
            setCheckingAdmin(false);
            lastCheckedUserId.current = null;
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async function signInWithMagicLink(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });
    return { data, error };
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  return {
    user,
    loading,
    isAdmin,
    checkingAdmin,
    signIn,
    signInWithMagicLink,
    signUp,
    signOut,
  };
}


