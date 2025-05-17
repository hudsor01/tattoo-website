/**
 * store-types.ts
 *
 * Type definitions for state management and stores.
 */

import { User, Session } from '@supabase/supabase-js';

// Auth types have been moved to auth-types.ts for better organization

/**
 * UI state interface
 */
export interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  toasts: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
  }>;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

/**
 * App global state interface
 */
export interface AppState {
  initialized: boolean;
  currentRoute: string | null;
  pageTitle: string;
  permissions: Record<string, boolean>;
  isLoading: boolean;
  currentUser: {
    id: string | null;
    name: string | null;
    email: string | null;
    isAdmin: boolean;
  };
  
  // Actions
  setInitialized: (initialized: boolean) => void;
  setCurrentRoute: (route: string) => void;
  setPageTitle: (title: string) => void;
  setPermission: (permission: string, value: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setCurrentUser: (user: AppState['currentUser']) => void;
  clearCurrentUser: () => void;
}