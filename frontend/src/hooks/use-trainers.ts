import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';
import {api} from '@/lib/api-client';
import {trainersKeys} from '@/lib/query-keys';
import type {
  CreateTrainerDto,
  TrainerResponseDto,
  UpdateTrainerDto,
} from '@/types';

export interface TrainerFilters {
  activeOnly?: boolean;
}

export const useTrainers = (filters?: TrainerFilters) => {
  return useQuery({
    queryKey: ['trainers', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.activeOnly) params.set('activeOnly', 'true');

      const queryString = params.toString();
      const endpoint = queryString ? `/trainers?${queryString}` : '/trainers';
      return api.get<TrainerResponseDto[]>(endpoint);
    },
  });
};

export const useTrainer = (id: string) => {
  return useQuery({
    queryKey: ['trainers', id],
    queryFn: () => api.get<TrainerResponseDto>(`/trainers/${id}`),
    enabled: !!id,
  });
};

export const useCreateTrainer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTrainerDto) =>
      api.post<TrainerResponseDto>('/trainers', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: trainersKeys.all()});
      toast.success('Тренер успешно создан');
    },
    onError: () => {
      toast.error('Ошибка при создании тренера');
    },
  });
};

export const useUpdateTrainer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: UpdateTrainerDto}) =>
      api.patch<TrainerResponseDto>(`/trainers/${id}`, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({queryKey: trainersKeys.all()});
      void queryClient.invalidateQueries({
        queryKey: ['trainers', variables.id],
      });
      toast.success('Данные тренера обновлены');
    },
    onError: () => {
      toast.error('Ошибка при обновлении тренера');
    },
  });
};

export const useDeleteTrainer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/trainers/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: trainersKeys.all()});
      toast.success('Тренер деактивирован');
    },
    onError: () => {
      toast.error('Ошибка при деактивации тренера');
    },
  });
};
