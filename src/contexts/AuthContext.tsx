import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  supabase: SupabaseClient;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthority: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthority, setIsAuthority] = useState(false);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      toast.error(
        'Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.'
      );
      return;
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    setSupabase(supabaseClient);

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRole(supabaseClient, session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRole(supabaseClient, session.user.id);
      } else {
        setIsAuthority(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (supabaseClient: SupabaseClient, userId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error checking user role:', error);
        setIsAuthority(false);
        return;
      }

      const hasAuthorityRole = data?.role === 'authority';
      setIsAuthority(hasAuthorityRole);

      if (!hasAuthorityRole) {
        toast.error('This account does not have authority access');
        await supabaseClient.auth.signOut();
      }
    } catch (error) {
      console.error('Error in checkUserRole:', error);
      setIsAuthority(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      toast.error('Supabase client not initialized');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) {
      toast.error('Supabase client not initialized');
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setIsAuthority(false);
  };

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h2>
          <p className="text-gray-600">
            Missing Supabase configuration. Please set the following environment variables:
          </p>
          <ul className="mt-4 text-left text-sm text-gray-500 space-y-2">
            <li>• VITE_SUPABASE_URL</li>
            <li>• VITE_SUPABASE_ANON_KEY</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, supabase, signIn, signOut, isAuthority }}>
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