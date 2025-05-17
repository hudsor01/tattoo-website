/**
 * src/store/useAppStore.ts
 * Global application state store using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppState } from '@/types/store-types';

/**
 * Main application store with persisted state
 */
export const useAppStore = create<AppState>()(
  persist(
    set => ({
      isLoading: false,
      currentUser: {
        id: null,
        name: null,
        email: null,
        isAdmin: false,
      },

      // Actions
      setLoading: isLoading => set({ isLoading }),
      setCurrentUser: user => set({ currentUser: user }),
      clearCurrentUser: () =>
        set({
          currentUser: {
            id: null,
            name: null,
            email: null,
            isAdmin: false,
          },
        }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
