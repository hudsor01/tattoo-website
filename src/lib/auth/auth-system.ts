/**
 * Unified Authentication System
 * 
 * This file provides a centralized authentication API that handles:
 * - User authentication state
 * - Role-based access control
 * - Session management
 * 
 * It unifies the previously separate auth implementations (useAuthStore and AuthProvider)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { checkIsAdmin } from '@/lib/supabase/database-functions';

// Auth Store Types
export interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  initialized: boolean;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // State actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

/**
 * Unified authentication store with persisted state
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Initialize Supabase client
      const supabase = createClient();

      return {
        // Initial state
        user: null,
        session: null,
        isLoading: true,
        isAdmin: false,
        initialized: false,

        // Auth actions
        signIn: async (email, password) => {
          set({ isLoading: true });
          try {
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            return { error };
          } catch (error) {
            console.error('Error signing in:', error);
            return {
              error: error instanceof Error ? error : new Error('Unknown error signing in'),
            };
          } finally {
            set({ isLoading: false });
          }
        },

        signUp: async (email, password, metadata) => {
          set({ isLoading: true });
          try {
            const { error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: metadata,
              },
            });

            return { error };
          } catch (error) {
            console.error('Error signing up:', error);
            return {
              error: error instanceof Error ? error : new Error('Unknown error signing up'),
            };
          } finally {
            set({ isLoading: false });
          }
        },

        signOut: async () => {
          set({ isLoading: true });
          try {
            await supabase.auth.signOut();
            set({ user: null, session: null, isAdmin: false });
          } catch (error) {
            console.error('Error signing out:', error);
          } finally {
            set({ isLoading: false });
          }
        },

        refreshUser: async () => {
          const state = get();
          if (state.isLoading) return; // Prevent concurrent refreshes

          set({ isLoading: true });
          try {
            // Use getUser for latest user data - safer than getSession
            const { data, error } = await supabase.auth.getUser();

            if (error) {
              console.error('Error refreshing user:', error);
              set({ user: null, session: null, isAdmin: false });
              return;
            }

            set({ user: data.user });

            if (data.user) {
              // Get session for tokens
              const { data: sessionData } = await supabase.auth.getSession();
              set({ session: sessionData.session });

              // Check if user is admin
              const isAdminUser = await checkIsAdmin(data.user);
              set({ isAdmin: isAdminUser });
            }
          } catch (error) {
            console.error('Error refreshing user:', error);
          } finally {
            set({ isLoading: false, initialized: true });
          }
        },

        // State actions
        setUser: user => set({ user }),
        setSession: session => set({ session }),
        setIsLoading: isLoading => set({ isLoading }),
        setIsAdmin: isAdmin => set({ isAdmin }),
        setInitialized: initialized => set({ initialized }),
      };
    },
    {
      name: 'auth-store',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for better security
      partialize: state => ({
        // Only persist non-sensitive data
        isAdmin: state.isAdmin,
        initialized: state.initialized,
        // Explicitly NOT persisting user or session for security
      }),
    }
  )
);

/**
 * Initialize auth state and set up listener
 * Can be used in the root layout or a provider component
 */
export function initializeAuth() {
  const { refreshUser, initialized } = useAuthStore.getState();
  
  if (!initialized) {
    // Initial state load
    refreshUser();
    
    // Set up auth state listener
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const store = useAuthStore.getState();
        
        store.setUser(session?.user || null);
        store.setSession(session);
        
        if (session?.user) {
          const isAdminUser = await checkIsAdmin(session.user);
          store.setIsAdmin(isAdminUser);
        } else {
          store.setIsAdmin(false);
        }
      }
    );
    
    // Return unsubscribe function
    return () => subscription.unsubscribe();
  }
  
  return () => {}; // No-op if already initialized
}

/**
 * Get authentication state properties
 * This function simplifies the API and ensures consistent usage
 */
export function getAuthState() {
  const state = useAuthStore.getState();
  
  return {
    user: state.user,
    session: state.session,
    isLoading: state.isLoading,
    isAdmin: state.isAdmin,
    isAuthenticated: !!state.user,
    initialized: state.initialized,
  };
}

/**
 * Get authentication actions
 * This function provides the auth methods in a consistent way
 */
export function getAuthActions() {
  const store = useAuthStore.getState();
  
  return {
    signIn: store.signIn,
    signUp: store.signUp,
    signOut: store.signOut,
    refreshUser: store.refreshUser,
  };
}

/**
 * Check if a user can access a route based on authentication and role
 */
export function checkAccess(options: { requireAdmin?: boolean } = {}) {
  const { requireAdmin = false } = options;
  const { user, isAdmin, isLoading } = getAuthState();
  
  // Always deny access while loading
  if (isLoading) return false;
  
  // Deny access if not authenticated
  if (!user) return false;
  
  // Deny access if admin required but user is not admin
  if (requireAdmin && !isAdmin) return false;
  
  // Allow access otherwise
  return true;
}
