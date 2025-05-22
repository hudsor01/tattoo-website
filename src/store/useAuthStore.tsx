"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  initialized: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'github', redirectTo?: string) => Promise<void>;
  sendMagicLink: (email: string, redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Auth store for managing authentication state
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  initialized: false,

  /**
   * Login with email and password
   */
  login: async (email: string, password: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user,
        session: data.session,
        isAdmin: data.user?.user_metadata?.['role'] === "admin",
      });

      return { user: data.user, error: null };
    } catch (error) {
      console.error("Login error:", error);
      return { user: null, error: error as Error };
    }
  },

  /**
   * Sign in with OAuth provider
   */
  signInWithOAuth: async (provider: 'google' | 'github', redirectTo?: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error(`OAuth sign in with ${provider} error:`, error);
      throw error;
    }
  },

  /**
   * Send magic link to email
   */
  sendMagicLink: async (email: string, redirectTo?: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Magic link send error:', error);
      throw error;
    }
  },

  /**
   * Logout the current user
   */
  logout: async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      set({ user: null, session: null, isAdmin: false });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  /**
   * Initialize the auth state
   */
  initialize: async () => {
    try {
      set({ isLoading: true });
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      
      if (data.user) {
        const { data: sessionData } = await supabase.auth.getSession();
        set({
          user: data.user,
          session: sessionData.session,
          isAdmin: data.user?.user_metadata?.['role'] === "admin",
        });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      set({ isLoading: false, initialized: true });
    }
  },

  /**
   * Refresh the session
   */
  refresh: async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        const { data: userData } = await supabase.auth.getUser();
        set({
          user: userData.user,
          session: data.session,
          isAdmin: userData.user?.user_metadata?.['role'] === "admin",
        });
      } else {
        set({ user: null, session: null, isAdmin: false });
      }
    } catch (error) {
      console.error("Session refresh error:", error);
    }
  },
}));