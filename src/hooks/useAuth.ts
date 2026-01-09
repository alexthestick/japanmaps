import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

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
      return;
    }

    try {
      isCheckingRef.current = true;
      setCheckingAdmin(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);

        // If profile doesn't exist or is_admin column doesn't exist, default to false
        if (error.code === 'PGRST116' || error.message.includes('column')) {
          console.warn('Profile not found or is_admin column missing. User is not admin.');
        }

        setIsAdmin(false);
        lastCheckedUserId.current = userId;
        return;
      }

      const adminStatus = data?.is_admin ?? false;
      setIsAdmin(adminStatus);
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


