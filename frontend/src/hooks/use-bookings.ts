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

export const useBookings = (filters?: BookingFilters) => {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.upcoming) params.set('upcoming', 'true');
      if (filters?.past) params.set('past', 'true');

      const queryString = params.toString();
      const endpoint = queryString ? `/bookings?${queryString}` : '/bookings';
      return api.get<BookingListResponseDto>(endpoint);
    },
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
