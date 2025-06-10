
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        try {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);

          // Create user profile if it doesn't exist
          if (session?.user && event === 'SIGNED_IN') {
            // Use setTimeout to prevent blocking and ensure proper cleanup
            setTimeout(async () => {
              if (!mounted) return;
              
              try {
                const { data: existingUser, error: checkError } = await supabase
                  .from('users')
                  .select('id')
                  .eq('id', session.user.id)
                  .single();

                if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
                  return;
                }

                if (!existingUser && mounted) {
                  // Получаем default organization для новых пользователей
                  const { data: defaultOrg, error: orgError } = await supabase
                    .from('organizations')
                    .select('id')
                    .eq('subdomain', 'default')
                    .single();

                  if (orgError) {
                    return;
                  }

                  if (defaultOrg && mounted) {
                    const { error: insertError } = await supabase
                      .from('users')
                      .insert({
                        id: session.user.id,
                        email: session.user.email || '',
                        name: session.user.user_metadata?.name || 'Пользователь',
                        role: 'viewer',
                        org_id: defaultOrg.id
                      });

                    if (insertError) {
                      console.error('Error creating user profile:', insertError);
                    }
                  }
                }
              } catch (error) {
                console.error('Error in user profile creation:', error);
              }
            }, 0);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error('Error getting session:', error);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      console.error('Error in getSession:', error);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });
    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
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
