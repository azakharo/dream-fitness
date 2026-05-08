import {useQuery} from '@tanstack/react-query';
import {api} from '@/lib/api-client';
import {scheduleKeys, trainersKeys, trainingsKeys} from '@/lib/query-keys';
import type {
  TrainerResponseDto,
  TrainingListResponseDto,
  TrainingResponseDto,
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
