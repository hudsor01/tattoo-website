/**
 * src/store/useUIStore.ts
 * Store for UI-related state management using Zustand
 */

import { create } from 'zustand';
import type { UIState } from '@/types/store-types';

// Helper to generate unique IDs for toasts
const generateId = () => Math.random().toString(36).substring(2, 9);

/**
 * UI state store
 */
export const useUIStore = create<UIState>()(set => ({
  sidebarOpen: false,
  darkMode: false,
  toasts: [],

  // Actions
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: open => set({ sidebarOpen: open }),

  toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),
  setDarkMode: enabled => set({ darkMode: enabled }),

  addToast: toast =>
    set(state => ({
      toasts: [...state.toasts, { id: generateId(), ...toast }],
    })),

  removeToast: id =>
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));
