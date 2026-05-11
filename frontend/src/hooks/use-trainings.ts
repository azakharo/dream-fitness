import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';
import {api} from '@/lib/api-client';
import {scheduleKeys, trainersKeys, trainingsKeys} from '@/lib/query-keys';
import type {
  CreateTrainingDto,
  TrainerResponseDto,
  TrainingBookingCountDto,
  TrainingListResponseDto,
  TrainingResponseDto,
  UpdateTrainingDto,
} from '@/types';

export interface TrainingFilters {
  type?: string;
  trainerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
}

export const useTrainings = (filters?: TrainingFilters) => {
  return useQuery({
    queryKey: trainingsKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.set('type', filters.type);
      if (filters?.trainerId) params.set('trainerId', filters.trainerId);
      if (filters?.dateFrom)
        params.set('dateFrom', filters.dateFrom.toISOString().split('T')[0]);
      if (filters?.dateTo)
        params.set('dateTo', filters.dateTo.toISOString().split('T')[0]);
      if (filters?.status) params.set('status', filters.status);

      const queryString = params.toString();
      const endpoint = queryString ? `/trainings?${queryString}` : '/trainings';
      return api.get<TrainingListResponseDto>(endpoint);
    },
  });
};

export const useTraining = (id: string) => {
  return useQuery({
    queryKey: trainingsKeys.detail(id),
    queryFn: () => api.get<TrainingResponseDto>(`/trainings/${id}`),
    enabled: !!id,
  });
};

export const useTrainers = () => {
  return useQuery({
    queryKey: trainersKeys.list(),
    queryFn: () => api.get<TrainerResponseDto[]>('/trainers'),
  });
};

export const useSchedule = (date?: Date) => {
  return useQuery({
    queryKey: scheduleKeys.byDate(date),
    queryFn: () => {
      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        return api.get<TrainingListResponseDto>(`/schedule/${dateStr}`);
      }
      return api.get<TrainingListResponseDto>('/schedule');
    },
  });
};

export const useCreateTraining = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTrainingDto) =>
      api.post<TrainingResponseDto>('/trainings', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: trainingsKeys.all()});
      void queryClient.invalidateQueries({queryKey: scheduleKeys.all()});
      toast.success('Тренировка успешно создана');
    },
    onError: () => {
      toast.error('Ошибка при создании тренировки');
    },
  });
};

export const useUpdateTraining = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: UpdateTrainingDto}) =>
      api.patch<TrainingResponseDto>(`/trainings/${id}`, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({queryKey: trainingsKeys.all()});
      void queryClient.invalidateQueries({
        queryKey: trainingsKeys.detail(variables.id),
      });
      void queryClient.invalidateQueries({queryKey: scheduleKeys.all()});
      toast.success('Тренировка обновлена');
    },
    onError: () => {
      toast.error('Ошибка при обновлении тренировки');
    },
  });
};

export const useDeleteTraining = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/trainings/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: trainingsKeys.all()});
      void queryClient.invalidateQueries({queryKey: scheduleKeys.all()});
      toast.success('Тренировка отменена');
    },
    onError: () => {
      toast.error('Ошибка при отмене тренировки');
    },
  });
};

export const useTrainingParticipants = (trainingId: string) => {
  return useQuery({
    queryKey: ['trainings', trainingId, 'participants'],
    queryFn: () =>
      api.get<TrainingBookingCountDto>(
        `/bookings/training/${trainingId}/count`,
      ),
    enabled: !!trainingId,
  });
};
