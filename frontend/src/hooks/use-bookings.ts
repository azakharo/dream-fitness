import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from '@/lib/api-client';
import {balanceKeys, bookingsKeys, trainingsKeys} from '@/lib/query-keys';
import type {
  BookingListResponseDto,
  BookingResponseDto,
  CreateBookingDto,
} from '@/types';

export interface BookingFilters {
  status?: string;
  upcoming?: boolean;
  past?: boolean;
}

/**
 * Fetch all bookings for the current user.
 * Note: Backend doesn't support filtering.
 * For client-side filtering, use useEnrichedBookings which handles all filters.
 */
export const useBookings = () => {
  return useQuery({
    queryKey: bookingsKeys.list(),
    queryFn: () => api.get<BookingListResponseDto>('/bookings'),
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: bookingsKeys.detail(id),
    queryFn: () => api.get<BookingResponseDto>(`/bookings/${id}`),
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingDto) =>
      api.post<BookingResponseDto>('/bookings', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: bookingsKeys.all()});
      void queryClient.invalidateQueries({queryKey: trainingsKeys.all()});
      void queryClient.invalidateQueries({queryKey: balanceKeys.all()});
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, reason}: {id: string; reason?: string}) =>
      api.post<BookingResponseDto>(`/bookings/${id}/cancel`, {
        reason: reason ?? '',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: bookingsKeys.all()});
      void queryClient.invalidateQueries({queryKey: trainingsKeys.all()});
      void queryClient.invalidateQueries({queryKey: balanceKeys.all()});
    },
  });
};
