import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User } from '@supabase/supabase-js';
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

  // Initial load
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const userProfile = await loadUserProfile(currentUser.id);
        setProfile(userProfile);

        // Sync to sessionState
        if (userProfile) {
          sessionState.setUser({
            id: userProfile.id,
            email: userProfile.email,
            full_name: userProfile.full_name || '',
            skin_type: userProfile.skin_type || undefined,
            concerns: userProfile.concerns || [],
            preferences: userProfile.preferences || {},
            lifestyle: userProfile.lifestyle || {},
          });
        }
      }

      setLoading(false);
    };

    init();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const authUser = session?.user ?? null;
        setUser(authUser);

        if (authUser) {
          const userProfile = await loadUserProfile(authUser.id);
          setProfile(userProfile);

          // Sync to sessionState
          if (userProfile) {
            sessionState.setUser({
              id: userProfile.id,
              email: userProfile.email,
              full_name: userProfile.full_name || '',
              skin_type: userProfile.skin_type || undefined,
              concerns: userProfile.concerns || [],
              preferences: userProfile.preferences || {},
              lifestyle: userProfile.lifestyle || {},
            });
          }
        } else {
          setProfile(null);

          // Clear user from sessionState but keep temp data
          sessionState.clearUser();
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Sign up
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // createUserProfile will merge temp data and clear it
      const success = await createUserProfile(email);
      if (success) {
        const newProfile = await loadUserProfile(data.user.id);
        setProfile(newProfile);

        // Sync to sessionState
        if (newProfile) {
          sessionState.setUser({
            id: newProfile.id,
            email: newProfile.email,
            full_name: newProfile.full_name || '',
            skin_type: newProfile.skin_type || undefined,
            concerns: newProfile.concerns || [],
            preferences: newProfile.preferences || {},
            lifestyle: newProfile.lifestyle || {},
          });
        }
      }
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const userProfile = await loadUserProfile(data.user.id);
      setProfile(userProfile);

      // Sync to sessionState
      if (userProfile) {
        sessionState.setUser({
          id: userProfile.id,
          email: userProfile.email,
          full_name: userProfile.full_name || '',
          skin_type: userProfile.skin_type || undefined,
          concerns: userProfile.concerns || [],
          preferences: userProfile.preferences || {},
          lifestyle: userProfile.lifestyle || {},
        });
      }
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);

    // Clear user from sessionState
    sessionState.clearUser();
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      const userProfile = await loadUserProfile(user.id);
      setProfile(userProfile);

      // Sync to sessionState
      if (userProfile) {
        sessionState.setUser({
          id: userProfile.id,
          email: userProfile.email,
          full_name: userProfile.full_name || '',
          skin_type: userProfile.skin_type || undefined,
          concerns: userProfile.concerns || [],
          preferences: userProfile.preferences || {},
          lifestyle: userProfile.lifestyle || {},
        });
      }
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