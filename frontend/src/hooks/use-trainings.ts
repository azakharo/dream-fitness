import {useQuery} from '@tanstack/react-query';
import {api} from '@/lib/api-client';
import type {
  TrainingListResponseDto,
  TrainingResponseDto,
  TrainerListResponseDto,
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
    queryKey: ['trainings', filters],
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
    queryKey: ['trainings', id],
    queryFn: () => api.get<TrainingResponseDto>(`/trainings/${id}`),
    enabled: !!id,
  });
};

export const useTrainers = () => {
  return useQuery({
    queryKey: ['trainers'],
    queryFn: () => api.get<TrainerListResponseDto>('/trainers'),
  });
};

export const useSchedule = (date?: Date) => {
  return useQuery({
    queryKey: ['schedule', date?.toISOString()],
    queryFn: () => {
      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        return api.get<TrainingListResponseDto>(`/schedule/${dateStr}`);
      }
      return api.get<TrainingListResponseDto>('/schedule');
    },
  });
};
