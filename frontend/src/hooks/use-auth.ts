import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useNavigate} from '@tanstack/react-router';
import {useAuthStore} from '@/stores/auth-store';
import {api} from '@/lib/api-client';
import {ROUTES} from '@/lib/routes';
import type {
  LoginDto,
  UserProfileDto,
  LoginResponseBody,
  RegisterResponseBody,
} from '@/types';
import type {RegisterFormData} from '@/schemas/auth.schema';

export const useLogin = () => {
  const navigate = useNavigate();
  const {setAccessToken, setUser} = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginDto) => {
      // 1. Login to get tokens
      const tokens = await api.post<LoginResponseBody>('/auth/login', data);
      // 2. Store access token
      setAccessToken(tokens.accessToken);
      // 3. Fetch user profile with the new token
      const user = await api.get<UserProfileDto>('/auth/me');
      return {tokens, user};
    },
    onSuccess: ({user}) => {
      setUser(user);
      // Type assertion needed due to Tanstack React Router strict typing
      void navigate({to: ROUTES.DASHBOARD as '.' | '..', search: true});
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  const {setAccessToken, setUser} = useAuthStore();

  return useMutation({
    // RegisterFormData has Date for birthDate, api.post will convert it to string
    mutationFn: async (data: RegisterFormData) => {
      // Backend returns { accessToken, user } and sets refreshToken cookie
      const response = await api.post<RegisterResponseBody>(
        '/auth/register',
        data,
      );
      return response;
    },
    onSuccess: ({accessToken, user}) => {
      // Store tokens and user - user is now authenticated
      setAccessToken(accessToken);
      setUser(user as UserProfileDto);
      // Navigate directly to dashboard (no need to login again)
      void navigate({to: ROUTES.DASHBOARD as '.' | '..', search: true});
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {logout: clearAuth} = useAuthStore();

  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      void navigate({to: ROUTES.LOGIN as '.' | '..', search: true});
    },
  });
};

export const useProfile = () => {
  const {accessToken} = useAuthStore();

  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get<UserProfileDto>('/auth/me'),
    enabled: !!accessToken,
  });
};
