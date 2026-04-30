import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  role: 'client' | 'admin';
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
}

interface AuthActions {
  logout: () => void;
  refreshTokens: () => Promise<void>;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

interface RefreshResponse {
  accessToken: string;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isLoading: true,

      logout: () => {
        set({accessToken: null, user: null});
      },

      refreshTokens: async () => {
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });
          if (!response.ok) {
            get().logout();
            throw new Error('Session expired');
          }
          const data = (await response.json()) as RefreshResponse;
          set({accessToken: data.accessToken});
        } catch {
          get().logout();
          throw new Error('Session expired');
        }
      },

      setAccessToken: token => set({accessToken: token}),
      setUser: user => set({user}),
      setLoading: loading => set({isLoading: loading}),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({accessToken: state.accessToken}),
    },
  ),
);
