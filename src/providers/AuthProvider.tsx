import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state change:', _event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Load profile when user signs in
      if (session?.user) {
        // Prevent multiple concurrent profile loads
        if (isLoadingProfile) {
          console.log('Profile loading already in progress, skipping...');
          return;
        }
        
        console.log('Loading profile for user:', session.user.id);
        setIsLoadingProfile(true);
        
        // Use RPC approach with timeout to prevent hanging
        console.log('Loading profile with RPC function...');
        try {
          // Add timeout to prevent RPC call from hanging indefinitely
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('RPC timeout')), 3000)
          );
          
          const rpcPromise = supabase
            .rpc('get_user_profile', { user_id: session.user.id });
          
          const { data, error } = await Promise.race([rpcPromise, timeoutPromise]) as any;
          
          console.log('RPC call completed. Data:', data, 'Error:', error);
          
          if (!error && data && Array.isArray(data) && data.length > 0) {
            console.log('Profile loaded successfully:', data[0]);
            setProfile(data[0] as Profile);
          } else {
            console.error('Error loading profile:', error);
            console.log('Setting profile to null due to error or no data');
            // Set profile to null but don't block the auth flow
            setProfile(null);
          }
        } catch (err) {
          console.error('Exception or timeout loading profile:', err);
          console.log('Setting profile to null due to exception/timeout');
          setProfile(null);
        }
        
        setIsLoadingProfile(false);
        // Only set loading to false after profile loading is complete
        setLoading(false);
      } else {
        console.log('No session user, clearing profile');
        setProfile(null);
        setIsLoadingProfile(false);
        // Set loading to false immediately when no user
        setLoading(false);
      }
    });

    // Fetch the initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        
        // Load profile for initial session using the same safe RPC function with timeout
        // Note: Don't check isLoadingProfile here - initial session should always load profile
        console.log('Loading initial profile for user:', session.user.id);
        
        try {
          // Add timeout to prevent RPC call from hanging indefinitely
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('RPC timeout')), 3000)
          );
          
          const rpcPromise = supabase
            .rpc('get_user_profile', { user_id: session.user.id });
          
          const { data, error } = await Promise.race([rpcPromise, timeoutPromise]) as any;
          
          console.log('Initial RPC call completed. Data:', data, 'Error:', error);
          
          if (!error && data && Array.isArray(data) && data.length > 0) {
            console.log('Initial profile loaded successfully:', data[0]);
            setProfile(data[0] as Profile);
          } else {
            console.error('Error loading initial profile:', error);
            setProfile(null);
          }
        } catch (err) {
          console.error('Exception or timeout loading initial profile:', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching profile:', error);
          } else {
            setProfile(data);
          }
        });
    } else {
      setProfile(null);
    }
  }, [user]);

  const needsProfileCompletion = () => {
    if (!profile) {
      console.log('needsProfileCompletion: no profile');
      return false;
    }
    const needsCompletion = !profile.first_name || !profile.last_name || !profile.role || !profile.profile_completed;
    // console.log('needsProfileCompletion check:', {
    //   first_name: profile.first_name,
    //   last_name: profile.last_name,
    //   role: profile.role,
    //   profile_completed: profile.profile_completed,
    //   needsCompletion
    // });
    return needsCompletion;
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

  const refreshProfile = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
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