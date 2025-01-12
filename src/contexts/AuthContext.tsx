import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  supabase: SupabaseClient;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthority: boolean;
  checkUserRole: (userId: string) => Promise<boolean>;
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

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    setSupabase(supabaseClient);

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          // Handle refresh token errors specifically
          if (sessionError.message.includes('refresh_token_not_found') || 
              sessionError.message.includes('Invalid Refresh Token')) {
            await handleRefreshTokenError(supabaseClient);
            return;
          }
          toast.error('Session error: ' + sessionError.message);
          return;
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          await checkUserRole(session.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        toast.error('There was a problem initializing authentication.');
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthority(false);
        return;
      }

      setUser(session?.user ?? null);
      if (session?.user) {
        await checkUserRole(session.user.id);
      } else {
        setIsAuthority(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRefreshTokenError = async (supabaseClient: SupabaseClient) => {
    console.log('Handling refresh token error');
    await supabaseClient.auth.signOut();
    setUser(null);
    setIsAuthority(false);
    toast.error('Your session has expired. Please sign in again.');
  };

  const checkUserRole = async (userId: string) => {
    if (!supabase) return false;

    try {
      console.log('Checking user role for:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking user role:', error);
        setIsAuthority(false);
        return false;
      }

      if (!data) {
        console.log('No role found for user, defaulting to non-authority');
        setIsAuthority(false);
        return false;
      }

      const hasAuthorityRole = data.role === 'authority';
      console.log('User authority status:', hasAuthorityRole);
      setIsAuthority(hasAuthorityRole);
      return hasAuthorityRole;
    } catch (error) {
      console.error('Error in checkUserRole:', error);
      setIsAuthority(false);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      toast.error('Supabase client not initialized');
      return;
    }

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      if (data.user) {
        await checkUserRole(data.user.id);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!supabase) {
      toast.error('Supabase client not initialized');
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthority(false);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
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
    <AuthContext.Provider value={{ user, supabase, signIn, signOut, isAuthority, checkUserRole }}>
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