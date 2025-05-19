/**
 * src/store/useAppStore.ts
 * Global application state store using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Interface for the current user data
 */
interface CurrentUser {
  id: string | null;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
}

/**
 * Interface for the app store state
 */
interface AppStoreState {
  isLoading: boolean;
  currentUser: CurrentUser;

  // Actions
  setLoading: (key: string, loading: boolean) => void;
  setCurrentUser: (user: CurrentUser) => void;
  clearCurrentUser: () => void;
}

/**
 * Main application store with persisted state
 */
export const useAppStore = create<AppStoreState>()(
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
      setLoading: (key: string, loading: boolean) => set({ isLoading: loading }),
      setCurrentUser: (user: CurrentUser) => set({ currentUser: user }),
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
