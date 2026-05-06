import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from '@/lib/api-client';
import type {WaitlistResponseDto} from '@/types';

export const useWaitlist = () => {
  return useQuery({
    queryKey: ['waitlist'],
    queryFn: () => api.get<WaitlistResponseDto[]>('/waitlist'),
  });
};

export const useWaitlistPosition = (trainingId: string) => {
  return useQuery({
    queryKey: ['waitlist', trainingId],
    queryFn: () => api.get<WaitlistResponseDto>(`/waitlist/${trainingId}`),
    enabled: !!trainingId,
  });
};

export const useJoinWaitlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trainingId: string) =>
      api.post<WaitlistResponseDto>('/waitlist', {trainingId}),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['waitlist']});
    },
  });
};

export const useLeaveWaitlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trainingId: string) =>
      api.delete<WaitlistResponseDto>(`/waitlist/${trainingId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['waitlist']});
    },
  });
};
