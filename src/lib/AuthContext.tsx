import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, UserProfile, loadUserProfile, createUserProfile } from './supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("DEBUG: Initial auth check - Current user:", user);
      setUser(user);

      if (user) {
        const userProfile = await loadUserProfile(user.id);
        setProfile(userProfile);
      }

      setLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const userProfile = await loadUserProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    console.log("DEBUG: Signup result - user:", data?.user);
    console.log("DEBUG: Signup result - session:", data?.session);
    console.log("DEBUG: Signup error:", error);

    if (error) {
      return { error: error.message };
    }

    // If signup succeeded but no session (email confirmation required)
    if (data.user && !data.session) {
      console.log("DEBUG: No session after signup, attempting auto-signin...");
      
      // Try to sign in immediately (works if email confirmation is disabled)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      console.log("DEBUG: Auto-signin result - session:", signInData?.session);
      console.log("DEBUG: Auto-signin error:", signInError);
      
      if (signInError) {
        // Email confirmation might be required - return success but inform user
        return { error: 'Account created! Please check your email to confirm your account.' };
      }
      
      // Now we have a session, create the profile
      if (signInData?.user) {
        const success = await createUserProfile(signInData.user.id, email, fullName);
        if (!success) {
          return { error: 'Failed to create user profile' };
        }
      }
    } else if (data.user && data.session) {
      // We have both user and session, create profile
      const success = await createUserProfile(data.user.id, email, fullName);
      if (!success) {
        return { error: 'Failed to create user profile' };
      }
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await loadUserProfile(user.id);
      setProfile(userProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

