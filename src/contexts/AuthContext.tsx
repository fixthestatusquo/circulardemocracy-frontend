import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react'; // type-only import
import { supabase } from '@/lib/supabase';
import type { User, AuthResponse } from '@supabase/supabase-js'; // type-only imports
import { AuthApiError } from '@supabase/supabase-js'; // Use AuthApiError

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: AuthResponse['data'] | null; error: AuthApiError | null }>;
  signUp: (email: string, password: string) => Promise<{ data: AuthResponse['data'] | null; error: AuthApiError | null }>;
  signOut: () => Promise<{ error: AuthApiError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const { data: authListener } = supabase!.auth.onAuthStateChange(
      async (_event, session) => { // Changed event to _event
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    // Initial check
    supabase!.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
    return { data, error: error instanceof AuthApiError ? error : null }; // Ensure error is AuthApiError
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase!.auth.signUp({ email, password });
    return { data, error: error instanceof AuthApiError ? error : null }; // Ensure error is AuthApiError
  };

  const signOut = async () => {
    const { error } = await supabase!.auth.signOut();
    return { error: error instanceof AuthApiError ? error : null }; // Ensure error is AuthApiError
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
