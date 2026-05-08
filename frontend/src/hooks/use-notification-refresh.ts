import {useEffect, useRef} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {useUnreadCount} from './use-notifications';
import {
  bookingsKeys,
  balanceKeys,
  trainingsKeys,
  waitlistKeys,
} from '@/lib/query-keys';

/**
 * Hook that triggers data refresh when new notifications arrive.
 *
 * When the unread notification count increases, it invalidates
 * related queries (bookings, balance, trainings, waitlist) to
 * ensure the UI reflects any state changes that triggered the notification.
 *
 * This leverages the existing notification polling (10s in prod, 60s in dev)
 * to detect events like waitlist promotions, booking cancellations, or balance changes.
 */
export const useNotificationRefresh = () => {
  const queryClient = useQueryClient();
  const {data: unreadData} = useUnreadCount();
  const previousCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (!unreadData) return;

    const currentCount = unreadData.count;
    const previousCount = previousCountRef.current;

    // First load - just store the count
    if (previousCount === null) {
      previousCountRef.current = currentCount;
      return;
    }

    // New notifications detected (count increased)
    if (currentCount > previousCount) {
      // Invalidate related queries to trigger refetch
      void queryClient.invalidateQueries({queryKey: bookingsKeys.all()});
      void queryClient.invalidateQueries({queryKey: balanceKeys.all()});
      void queryClient.invalidateQueries({queryKey: trainingsKeys.all()});
      void queryClient.invalidateQueries({queryKey: waitlistKeys.all()});
    }

    // Update stored count
    previousCountRef.current = currentCount;
  }, [unreadData, queryClient]);
};
