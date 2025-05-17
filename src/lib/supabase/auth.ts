/**
 * Supabase Authentication
 * 
 * Client-side authentication methods for Supabase
 */

import { createClient } from './client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandling } from '@/hooks/use-error-handling';

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const toast = useToast();
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sign in';
    toast.error(message);
    throw error;
  }
}

/**
 * Sign in with a third-party provider
 */
export async function signInWithProvider(provider: 'google' | 'facebook' | 'twitter' | 'apple') {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sign in';
    toast.error(message);
    throw error;
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  try {
    const supabase = createClient();
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

    return { user: data.user, session: data.session };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sign up';
    toast.error(message);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sign out';
    toast.error(message);
    throw error;
  }
}

/**
 * Send a password reset email
 */
export async function resetPassword(email: string) {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send reset password email';
    toast.error(message);
    throw error;
  }
}

/**
 * Update a user's password
 */
export async function updateUserPassword(password: string) {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update password';
    toast.error(message);
    throw error;
  }
}

/**
 * Update a user's email
 */
export async function updateUserEmail(email: string) {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      email,
    });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update email';
    toast.error(message);
    throw error;
  }
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

/**
 * Get the current user
 */
export async function getUser(): Promise<User | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return data.user;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<Session | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      throw error;
    }

    return data.session;
  } catch (error) {
    console.error('Failed to refresh session:', error);
    return null;
  }
}

/**
 * Check if the current user has the specified role
 */
export async function hasRole(role: string): Promise<boolean> {
  const user = await getUser();
  return user?.user_metadata?.role === role;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin');
}