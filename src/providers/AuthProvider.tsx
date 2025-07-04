import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError, PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { AuthContext } from '@/contexts/auth';

type Profile = Tables<'profiles'>;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUserSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (isMounted) {
          setSession(session);
          const currentUser = session?.user ?? null;
          setUser(currentUser);

          if (currentUser) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();

            if (profileError) {
              console.error('Error fetching profile:', profileError);
              setProfile(null);
            } else {
              setProfile(profileData);
            }
          } else {
            setProfile(null);
          }
        }
      } catch (e) {
        console.error('Error in initial session fetch:', e);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (event === 'SIGNED_IN' && currentUser) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile on sign in:', profileError);
            setProfile(null);
          } else {
            setProfile(profileData);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password:string, metadata: Record<string, string>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
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

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: PostgrestError | null }> => {
    if (!user) {
      return {
        error: {
          message: 'User not logged in',
          details: 'You must be logged in to update your profile.',
          hint: 'Try logging in again.',
          code: '401',
        } as PostgrestError,
      };
    }
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (!error) {
      setProfile(prev => (prev ? { ...prev, ...updates } : null));
    }
    return { error };
  };

  const needsProfileCompletion = () => {
    if (!profile) return false;
    if (profile.role === 'super_admin') return false;
    return !profile.profile_completed;
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
      case 'driver':
        return '/driver-dashboard';
      default:
        return '/';
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) {
      console.error('Error refreshing profile:', error);
      setProfile(null);
    } else {
      setProfile(data);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      needsProfileCompletion,
      getRoleRedirectPath,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};