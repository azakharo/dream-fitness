import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from '@/lib/api-client';
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
    queryKey: ['bookings'],
    queryFn: () => api.get<BookingListResponseDto>('/bookings'),
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: ['bookings', id],
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
      void queryClient.invalidateQueries({queryKey: ['bookings']});
      void queryClient.invalidateQueries({queryKey: ['trainings']});
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id}: {id: string; reason?: string}) =>
      api.delete<BookingResponseDto>(`/bookings/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['bookings']});
      void queryClient.invalidateQueries({queryKey: ['trainings']});
    },
  });
};
