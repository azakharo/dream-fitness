import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useAuthStore} from '@/stores/auth-store';
import {api} from '@/lib/api-client';
import {notificationsKeys} from '@/lib/query-keys';
import type {NotificationListResponseDto} from '@/types';

const refetchInterval = import.meta.env.DEV ? 60000 : 10000;

export const useNotifications = (limit?: number) => {
  const {accessToken} = useAuthStore();

  return useQuery({
    queryKey: notificationsKeys.list(limit),
    queryFn: () => {
      const endpoint = limit
        ? `/notifications?limit=${limit}`
        : '/notifications';
      return api.get<NotificationListResponseDto>(endpoint);
    },
    enabled: !!accessToken,
    refetchInterval,
  });
};

export const useUnreadCount = () => {
  const {accessToken} = useAuthStore();

  return useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: () => api.get<{count: number}>('/notifications/unread-count'),
    enabled: !!accessToken,
    refetchInterval,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      api.patch<void>(`/notifications/${notificationId}/read`),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: notificationsKeys.all()});
    },
  });
};
