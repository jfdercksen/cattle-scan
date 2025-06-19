
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

type Profile = Tables<'profiles'>;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  needsProfileCompletion: () => boolean;
  getRoleRedirectPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id || 'no user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile with proper error handling
          setTimeout(async () => {
            try {
              console.log('Fetching profile for user:', session.user.id);
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.error('Error fetching profile:', error.message);
                // If no profile exists yet, that might be okay during signup
                if (error.code !== 'PGRST116') { // Not "no rows returned"
                  console.error('Unexpected profile fetch error:', error);
                }
              } else {
                console.log('Profile loaded successfully:', profileData.role);
                setProfile(profileData);
              }
            } catch (error) {
              console.error('Profile fetch error:', error);
            }
          }, 100); // Small delay to ensure database trigger has run
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id ? 'Found session' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          try {
            console.log('Initial profile fetch for user:', session.user.id);
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.error('Error fetching initial profile:', error.message);
            } else {
              console.log('Initial profile loaded successfully:', profileData.role);
              setProfile(profileData);
            }
          } catch (error) {
            console.error('Initial profile fetch error:', error);
          }
          setLoading(false);
        }, 100);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: any) => {
    console.log('Starting signup process for:', email);
    console.log('Signup metadata:', metadata);
    
    // Input validation
    if (!email || !password) {
      return { error: new Error('Email and password are required') };
    }
    
    if (password.length < 6) {
      return { error: new Error('Password must be at least 6 characters long') };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: new Error('Please enter a valid email address') };
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      console.log('Signup redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata
        }
      });
      
      console.log('Signup response data:', data);
      console.log('Signup response error:', error);
      
      return { error };
    } catch (error) {
      console.error('Signup catch error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    // Input validation
    if (!email || !password) {
      return { error: new Error('Email and password are required') };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }
    
    return { error };
  };

  const needsProfileCompletion = () => {
    if (!profile || !user) return false;
    
    // Super admins don't need profile completion
    if (profile.role === 'super_admin') return false;
    
    // Check the profile_completed flag
    return !profile.profile_completed;
  };

  const getRoleRedirectPath = () => {
    if (!profile) return '/';
    
    switch (profile.role) {
      case 'super_admin':
      case 'admin':
        return '/admin';
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
      getRoleRedirectPath
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
