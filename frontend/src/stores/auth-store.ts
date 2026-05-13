import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import type {UserProfileDto, LoginResponseBody} from '@/types';
import {api} from '@/lib/api-client';

type User = UserProfileDto;
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

type RefreshResponse = LoginResponseBody;

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
      partialize: state => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
);

export const initializeAuth = async () => {
  const {accessToken, setLoading, setUser, logout} = useAuthStore.getState();

  setLoading(true);

  if (accessToken) {
    try {
      const user = await api.get<UserProfileDto>('/auth/me');
      setUser(user);
    } catch {
      logout();
    }
  }

  setLoading(false);
};

initializeAuth().catch(console.error);
