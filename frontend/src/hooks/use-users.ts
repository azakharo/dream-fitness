import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';
import {api} from '@/lib/api-client';
import type {UpdateUserStatusDto, UserDto, UserListResponseDto} from '@/types';

export interface UserFilters {
  search?: string;
  role?: 'client' | 'admin';
  status?: 'active' | 'blocked';
  page?: number;
  limit?: number;
}

export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.set('search', filters.search);
      if (filters?.role) params.set('role', filters.role);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.limit) params.set('limit', String(filters.limit));

      const queryString = params.toString();
      const endpoint = queryString
        ? `/auth/users?${queryString}`
        : '/auth/users';
      return api.get<UserListResponseDto>(endpoint);
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => api.get<UserDto>(`/auth/users/${id}`),
    enabled: !!id,
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.patch<UserDto>(`/auth/users/${id}/status`, {
        status: 'blocked',
      } as UpdateUserStatusDto),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({queryKey: ['users']});
      void queryClient.invalidateQueries({queryKey: ['users', variables]});
      toast.success('Пользователь заблокирован');
    },
    onError: () => {
      toast.error('Ошибка при блокировке пользователя');
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.patch<UserDto>(`/auth/users/${id}/status`, {
        status: 'active',
      } as UpdateUserStatusDto),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({queryKey: ['users']});
      void queryClient.invalidateQueries({queryKey: ['users', variables]});
      toast.success('Пользователь разблокирован');
    },
    onError: () => {
      toast.error('Ошибка при разблокировке пользователя');
    },
  });
};
