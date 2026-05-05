import {useQuery} from '@tanstack/react-query';
import {useAuthStore} from '@/stores/auth-store';
import {api} from '@/lib/api-client';
import type {components} from '@/types/api.generated';

type NotificationResponse = components['schemas']['NotificationResponseDto'];

export const useNotifications = (limit?: number) => {
  const {accessToken} = useAuthStore();

  return useQuery({
    queryKey: ['notifications', limit],
    queryFn: () => {
      const endpoint = limit
        ? `/notifications?limit=${limit}`
        : '/notifications';
      return api.get<NotificationResponse[]>(endpoint);
    },
    enabled: !!accessToken,
  });
};

export const useUnreadCount = () => {
  const {accessToken} = useAuthStore();

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get<{count: number}>('/notifications/unread-count'),
    enabled: !!accessToken,
    refetchInterval: 60000, // Refetch every minute
  });
};
