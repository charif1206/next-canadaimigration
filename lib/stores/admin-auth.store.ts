/**
 * Admin Auth Store (Zustand)
 * Separate from the regular user auth store.
 * Used exclusively by /admin/* pages.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  role: string;
}

interface AdminAuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setAuth: (token: string, user: AdminUser) => void;
  clearAuth: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      setAuth: (token: string, user: AdminUser) => {
        set({ token, user, isAuthenticated: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_token', token);
          localStorage.setItem('admin_user', JSON.stringify(user));
          // Set cookie so Next.js middleware can read it (middleware can't access localStorage)
          document.cookie = `admin_token=${token}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`;
        }
      },

      clearAuth: () => {
        set({ token: null, user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          // Clear the cookie
          document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.token && state.user && typeof window !== 'undefined') {
            localStorage.setItem('admin_token', state.token);
            localStorage.setItem('admin_user', JSON.stringify(state.user));
            // Re-set cookie so middleware can still read it after a hard refresh
            document.cookie = `admin_token=${state.token}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`;
          }
          state.setHasHydrated(true);
        }
      },
    },
  ),
);
