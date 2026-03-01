import { useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { User, Session, AuthError, PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { AuthContext } from '@/contexts/auth';

type Profile = Tables<'profiles'>;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const loadedUserIdRef = useRef<string | null>(null);
  const profileRef = useRef<Profile | null>(null);
  const isLoadingProfileRef = useRef<boolean>(false);
  const lastSignInTimeRef = useRef<number>(0);
  const resolveSiteUrl = () => {
    const envUrl = import.meta.env.VITE_SITE_URL as string | undefined;
    const baseUrl = (envUrl || window.location.origin).replace(/\/$/, '');
    return baseUrl;
  };

  const updateProfileState = (value: Profile | null) => {
    profileRef.current = value;
    setProfile(value);
  };

  const setProfileLoadingFlag = (value: boolean, manageState: boolean) => {
    isLoadingProfileRef.current = value;
    if (manageState) {
      setIsLoadingProfile(value);
    }
  };

  const fetchProfileWithFallback = async (userId: string): Promise<Profile | null> => {
    // Direct table query is more reliable than RPC, so use it directly with 5 second timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
    );
    
    const queryPromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    try {
      const { data, error } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as { data: Profile | null; error: PostgrestError | null };

      if (error) {
        console.error('Profile fetch failed:', error);
        throw error;
      }

      return data ?? null;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  };

  const loadProfile = useCallback(async (
    userId: string,
    {
      keepExistingOnError = true,
      manageLoadingState = true,
      force = false,
    }: { keepExistingOnError?: boolean; manageLoadingState?: boolean; force?: boolean } = {}
  ) => {
    if (isLoadingProfileRef.current && !force) {
      console.log('Profile loading already in progress, skipping...');
      return profileRef.current;
    }

    setProfileLoadingFlag(true, manageLoadingState);

    try {
      const profileData = await fetchProfileWithFallback(userId);
      updateProfileState(profileData);
      loadedUserIdRef.current = userId;
      return profileData;
    } catch (error) {
      console.error('Error loading profile:', error);
      if (!keepExistingOnError) {
        updateProfileState(null);
      }
      throw error;
    } finally {
      setProfileLoadingFlag(false, manageLoadingState);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Ignore token refresh events triggered on tab visibility changes to avoid unnecessary reloads
      if (_event === 'TOKEN_REFRESHED') {
        return;
      }

      if (session?.user) {
        // Track sign-in time to detect spurious SIGNED_OUT events
        if (_event === 'SIGNED_IN') {
          lastSignInTimeRef.current = Date.now();
        }
        
        if (loadedUserIdRef.current === session.user.id && profileRef.current) {
          setLoading(false);
          setInitialized(true);
          return;
        }

        if (isLoadingProfileRef.current) {
          return;
        }

        try {
          await loadProfile(session.user.id, { keepExistingOnError: true });
        } catch (err) {
          console.error('Profile load failed after fallback attempts:', err);
        } finally {
          setLoading(false);
          setInitialized(true);
        }
      } else {
        if (_event === 'INITIAL_SESSION') {
          return;
        }

        // Only clear profile on explicit SIGNED_OUT event, not on transient session issues
        if (_event === 'SIGNED_OUT') {
          // Ignore SIGNED_OUT events that happen within 5 seconds of SIGNED_IN (likely spurious)
          const timeSinceSignIn = Date.now() - lastSignInTimeRef.current;
          if (timeSinceSignIn < 5000 && lastSignInTimeRef.current > 0) {
            return;
          }
          loadedUserIdRef.current = null;
          updateProfileState(null);
          setProfileLoadingFlag(false, true);
          setLoading(false);
          setInitialized(true);
          lastSignInTimeRef.current = 0;
        }
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Check if profile is already being loaded by auth state change handler
        if (isLoadingProfileRef.current) {
          return;
        }
        
        // Check if profile already loaded for this user
        if (loadedUserIdRef.current === session.user.id && profileRef.current) {
          setLoading(false);
          setInitialized(true);
          return;
        }

        setSession(session);
        setUser(session.user);

        try {
          await loadProfile(session.user.id, { keepExistingOnError: true });
        } catch (err) {
          console.error('Initial profile load failed after fallback attempts:', err);
        } finally {
          setLoading(false);
          setInitialized(true);
        }
      } else {
        updateProfileState(null);
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const needsProfileCompletion = () => {
    if (!profile) {
      console.log('needsProfileCompletion: no profile');
      return false;
    }
    return !profile.first_name || !profile.last_name || !profile.role || !profile.profile_completed;
  };

  const getRoleRedirectPath = () => {
    if (!profile) return '/';
    switch (profile.role) {
      case 'super_admin':
      case 'admin':
        return '/admin-dashboard';
      case 'seller':
        return '/seller-dashboard';
      case 'agent':
        return '/agent-dashboard';
      case 'vet':
        return '/vet-dashboard';
      case 'load_master':
        return '/load-master-dashboard';
      default:
        return '/';
    }
  };

  const signUp = async (email: string, password: string, metadata: Record<string, string>) => {
    const siteUrl = resolveSiteUrl();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/`,
        data: metadata,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        await loadProfile(user.id, { keepExistingOnError: true, manageLoadingState: false, force: true });
      } catch (error) {
        console.error('Error refreshing profile:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      initialized,
      isLoadingProfile,
      needsProfileCompletion,
      getRoleRedirectPath,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};