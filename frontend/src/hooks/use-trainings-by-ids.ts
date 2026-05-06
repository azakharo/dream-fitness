import {useQueries, useQuery} from '@tanstack/react-query';
import {api} from '@/lib/api-client';
import type {TrainingResponseDto} from '@/types';

export const useTraining = (id: string) => {
  return useQuery({
    queryKey: ['trainings', id],
    queryFn: () => api.get<TrainingResponseDto>(`/trainings/${id}`),
    enabled: !!id,
  });
};

export const useTrainingsByIds = (ids: string[]) => {
  const uniqueIds = [...new Set(ids)].filter(Boolean);

  const results = useQueries({
    queries: uniqueIds.map(id => ({
      queryKey: ['trainings', id],
      queryFn: () => api.get<TrainingResponseDto>(`/trainings/${id}`),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const trainingsMap = new Map<string, TrainingResponseDto>();
  results.forEach((result, index) => {
    if (result.data) {
      trainingsMap.set(uniqueIds[index], result.data);
    }
  });

  return {
    data: trainingsMap,
    isLoading: results.some(r => r.isLoading),
    isError: results.some(r => r.isError),
  };
};
