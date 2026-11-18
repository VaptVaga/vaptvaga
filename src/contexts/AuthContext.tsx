import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  type AuthProfile,
  getCachedProfile,
  setCachedProfile,
  mergeProfileData,
} from '../lib/profileCache';

type Profile = AuthProfile;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  updateLocalProfile: (updates: Partial<Profile> & Record<string, unknown>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<User | null>(null);

  const setStableProfile = useCallback((nextProfile: Profile | null) => {
    setProfile((prev) => {
      if (prev === nextProfile) return prev;
      try {
        if (prev && nextProfile && JSON.stringify(prev) === JSON.stringify(nextProfile)) {
          return prev;
        }
      } catch {
        // Fallback to updating state
      }
      return nextProfile;
    });
  }, []);

  const fetchProfile = useCallback(
    async (userId: string, authUser?: User | null) => {
      const cached = getCachedProfile(userId);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          if (cached) {
            setStableProfile(cached as Profile);
          }
          return;
        }

        if (data) {
          const merged = mergeProfileData(data as Record<string, unknown>, cached);
          if (merged) {
            setCachedProfile(userId, merged as unknown as Record<string, unknown>);
            setStableProfile(merged);
          }
        } else if (authUser) {
          // User authenticated without a row in public.profiles yet: bootstrap initial row
          const initialName =
            (cached?.name as string) ||
            (authUser.user_metadata?.full_name as string) ||
            authUser.email?.split('@')[0] ||
            'Usuário';
          const initialRole = (cached?.role as string) || 'freelancer';
          const initialProfile: Partial<Profile> = {
            ...(cached || {}),
            id: userId,
            name: initialName,
            role: initialRole,
            created_at: new Date().toISOString(),
          };

          try {
            await (supabase.from('profiles') as unknown as {
              upsert: (values: Record<string, unknown>, opts?: { onConflict?: string }) => Promise<unknown>;
            }).upsert(
              {
                id: userId,
                name: initialName,
                role: initialRole,
              },
              { onConflict: 'id' }
            );
          } catch {
            // Non-blocking fallback
          }

          setCachedProfile(userId, initialProfile as Record<string, unknown>);
          setStableProfile(initialProfile as Profile);
        }
      } finally {
        setLoading(false);
      }
    },
    [setStableProfile]
  );

  useEffect(() => {
    let mounted = true;

    const safetyTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!mounted) return;
        setSession(initialSession);
        userRef.current = initialSession?.user ?? null;
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const cached = getCachedProfile(initialSession.user.id);
          if (cached) {
            setStableProfile(cached as Profile);
          }
          void fetchProfile(initialSession.user.id, initialSession.user);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    // IMPORTANT: Keep onAuthStateChange callback synchronous (no await inside)
    // to prevent @supabase/supabase-js NavigatorLockAcquireTimeoutError deadlocks.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);
      userRef.current = nextSession?.user ?? null;
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        const currentUser = nextSession.user;
        const cached = getCachedProfile(currentUser.id);
        if (cached) {
          setStableProfile(cached as Profile);
        } else {
          setLoading(true);
        }
        setTimeout(() => {
          if (mounted) {
            void fetchProfile(currentUser.id, currentUser);
          }
        }, 0);
      } else {
        setStableProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [fetchProfile, setStableProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error?.message || null };
  };

  const signOut = async () => {
    // Clear React state synchronously so route guards/redirects react immediately
    setSession(null);
    userRef.current = null;
    setUser(null);
    setProfile(null);
    setLoading(false);

    // Clear Supabase auth tokens from localStorage/sessionStorage synchronously
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('sb-')) sessionStorage.removeItem(key);
      });
    } catch {
      // Ignore storage errors
    }

    // Attempt local/server signout with a short timeout so a stuck lock never blocks logout
    try {
      await Promise.race([
        supabase.auth.signOut({ scope: 'local' }),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    } catch {
      // Already cleared locally
    }
  };

  const refreshProfile = async () => {
    const activeUser = userRef.current || user;
    if (activeUser) {
      await fetchProfile(activeUser.id, activeUser);
    }
  };

  const updateLocalProfile = useCallback(
    (updates: Partial<Profile> & Record<string, unknown>) => {
      const targetId = (updates.id as string) || userRef.current?.id || user?.id;
      if (targetId) {
        setCachedProfile(targetId, updates);
      }
      setProfile((prev) => {
        const next = {
          ...(prev || { id: targetId || '', role: 'freelancer', created_at: new Date().toISOString() }),
          ...updates,
        } as Profile;
        return next;
      });
    },
    [user?.id]
  );

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    signOut,
    signIn,
    signUp,
    refreshProfile,
    updateLocalProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
