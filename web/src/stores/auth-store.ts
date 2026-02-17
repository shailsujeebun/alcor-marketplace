import { create } from 'zustand';
import type { User } from '@/types/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) => {
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },

  setUser: (user) => set({ user }),

  setAccessToken: (token) => set({ accessToken: token }),

  logout: () => {
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
