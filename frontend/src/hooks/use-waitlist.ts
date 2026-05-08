import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from '@/lib/api-client';
import {waitlistKeys} from '@/lib/query-keys';
import type {WaitlistResponseDto} from '@/types';

export const useWaitlist = () => {
  return useQuery({
    queryKey: waitlistKeys.lists(),
    queryFn: () => api.get<WaitlistResponseDto[]>('/waitlist'),
  });
};

export const useWaitlistPosition = (trainingId: string) => {
  return useQuery({
    queryKey: waitlistKeys.detail(trainingId),
    queryFn: () =>
      api.get<WaitlistResponseDto>(
        `/waitlist/position?trainingId=${trainingId}`,
      ),
    enabled: !!trainingId,
  });
};

export const useJoinWaitlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trainingId: string) =>
      api.post<WaitlistResponseDto>('/waitlist', {trainingId}),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: waitlistKeys.all()});
    },
  });
};

export const useLeaveWaitlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trainingId: string) =>
      api.delete<WaitlistResponseDto>(`/waitlist?trainingId=${trainingId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: waitlistKeys.all()});
    },
  });
};
