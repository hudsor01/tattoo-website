'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Session, User, AuthError } from '@supabase/supabase-js';

/**
 * Hook for authentication functionality
 */
export function useAuth() {
  const toast = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Initialize session and user
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);
          }
        );
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, [supabase.auth]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      setSession(data.session);
      setUser(data.user);
      
      return data.user;
    } catch (error: Error | AuthError | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    setIsAuthenticating(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        throw error;
      }
      
      return data.user;
    } catch (error: Error | AuthError | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      router.push('/auth/signin');
    } catch (error: Error | AuthError | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      toast.error(errorMessage);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Password reset email sent');
      return true;
    } catch (error: Error | AuthError | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset password email';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Password updated successfully');
      return true;
    } catch (error: Error | AuthError | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Check if user has admin role
  const isAdmin = (): boolean => {
    if (!user) return false;
    
    // Check user metadata
    if (user.user_metadata?.role === 'admin') {
      return true;
    }
    
    return false;
  };

  return {
    session,
    user,
    isLoading,
    isAuthenticating,
    isAuthenticated: !!user,
    isAdmin: isAdmin(),
    
    // Auth functions
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
}