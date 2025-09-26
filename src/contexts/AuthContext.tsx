import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, type User as APIUser } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: APIUser | null;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<APIUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing token and validate it
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token by fetching current user
      authAPI.getCurrentUser()
        .then((response) => {
          setUser(response.data.user);
          // Welcome message
          const firstName = response.data.user.firstName || 'Health Hero';
          toast({
            title: `Welcome back, ${firstName}! 💚`,
            description: "Let's charge your health battery today! ⚡🥗",
          });
        })
        .catch(() => {
          // Token invalid, remove it
          localStorage.removeItem('authToken');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [toast]);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const response = await authAPI.register(email, password, firstName || '', lastName);

      // Store token
      localStorage.setItem('authToken', response.data.token);
      setUser(response.data.user);

      toast({
        title: `Yay 🎉 Welcome to Health-o-Meter, ${firstName || 'Health Hero'}!`,
        description: "Your wellness journey starts here 🌱",
      });

      return { error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Something went wrong';
      toast({
        title: "⚠️ Hmm, signup hiccup!",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);

      // Store token
      localStorage.setItem('authToken', response.data.token);
      setUser(response.data.user);

      return { error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Connection issue';
      toast({
        title: "⚠️ Login trouble!",
        description: errorMessage === 'Invalid credentials'
          ? "Hmm, those credentials don't look right 🤔 Double-check and try again!"
          : errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('authToken');
      setUser(null);
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