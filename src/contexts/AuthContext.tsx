import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, firstName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Health-o-Meter AI companion messages
        if (event === 'SIGNED_IN' && session?.user) {
          const firstName = session.user.user_metadata?.first_name || 'Health Hero';
          toast({
            title: `Welcome back, ${firstName}! 💚`,
            description: "Let's charge your health battery today! ⚡🥗",
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string, firstName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
          }
        }
      });

      if (error) {
        toast({
          title: "⚠️ Hmm, signup hiccup!",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `Yay 🎉 Welcome to Health-o-Meter, ${firstName || 'Health Hero'}!`,
          description: "Your wellness journey starts here 🌱 Check your email to verify your account!",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "⚠️ Oops, something went wrong!",
        description: "Try refreshing the page 🔄 and try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "⚠️ Login trouble!",
          description: error.message === 'Invalid login credentials' 
            ? "Hmm, those credentials don't look right 🤔 Double-check and try again!"
            : error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "⚠️ Oops, connection issue!",
        description: "Try refreshing the page 🔄 and try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "👋 See you soon!",
        description: "Keep up the healthy habits! Your progress is saved 💪",
      });
    } catch (error: any) {
      toast({
        title: "⚠️ Logout hiccup",
        description: "Try refreshing the page 🔄",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signOut,
      loading,
    }}>
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