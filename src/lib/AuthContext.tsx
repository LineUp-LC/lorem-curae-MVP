import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import {
  supabase,
  UserProfile,
  loadUserProfile,
  createUserProfile,
} from './supabase';
import { sessionState } from '../utils/sessionState';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile to sessionState
  const syncProfileToSessionState = (userProfile: UserProfile) => {
    sessionState.setUser({
      id: userProfile.id,
      email: userProfile.email,
      full_name: userProfile.full_name || '',
      skin_type: userProfile.skin_type || undefined,
      concerns: userProfile.concerns || [],
      preferences: userProfile.preferences || {},
      lifestyle: userProfile.lifestyle || {},
    });
  };

  // Initial load + auth listener
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const userProfile = await loadUserProfile(currentUser.id);
        if (isMounted) {
          setProfile(userProfile);
          if (userProfile) syncProfileToSessionState(userProfile);
        }
      }

      if (isMounted) setLoading(false);
    };

    init();

    // Auth state listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return;

        const authUser = session?.user ?? null;
        setUser(authUser);

        if (event === 'SIGNED_IN' && authUser) {
          // Check if profile exists
          const existing = await loadUserProfile(authUser.id);

          // Create only if missing
          if (!existing) {
            await createUserProfile(authUser);
          }

          // Load profile after ensuring it exists
          const userProfile = await loadUserProfile(authUser.id);

          if (isMounted) {
            setProfile(userProfile);
            if (userProfile) syncProfileToSessionState(userProfile);
          }
        }

        if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setProfile(null);
            sessionState.clearUser();
          }
        }
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Sign Up
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
  };

  // Sign In
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  // Sign Out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Refresh profile manually
  const refreshProfile = async () => {
    if (user) {
      const userProfile = await loadUserProfile(user.id);
      setProfile(userProfile);

      if (userProfile) syncProfileToSessionState(userProfile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}