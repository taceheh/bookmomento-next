// stores/auth.ts
'use client';
import { create } from 'zustand';

type AuthUser = { id: string; email?: string | null; [k: string]: any } | null;

type AuthState = {
  user: AuthUser;
  loading: boolean;
  setUser: (u: AuthUser) => void;
  setLoading: (b: boolean) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (u) => set({ user: u }),
  setLoading: (b) => set({ loading: b }),
  reset: () => set({ user: null, loading: false }),
}));
