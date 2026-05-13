import React from 'react';
import {useParams, useRouter} from '@tanstack/react-router';
import {toast} from 'sonner';

import {PageHeader} from '@/components/common/PageHeader';
import {TrainingForm} from '@/components/admin/trainings/TrainingForm';
import {useTraining, useUpdateTraining} from '@/hooks/use-trainings';
import {useTrainers} from '@/hooks/use-trainers';
import type {UpdateTrainingDto} from '@/types';

export const AdminScheduleEditPage: React.FC = () => {
  const router = useRouter();
  const {id} = useParams({from: '/admin/schedule/edit/$id'});
  const {data: training, isLoading: trainingLoading} = useTraining(id);
  const {data: trainersData} = useTrainers({activeOnly: true});
  const updateTraining = useUpdateTraining();

  const trainers = trainersData ?? [];

  const handleSuccess = () => {
    void router.history.back();
  };

  const handleCancel = () => {
    void router.history.back();
  };

  const handleSubmit = (data: {
    title: string;
    type: string;
    trainerId: string;
    scheduledAt: Date;
    durationMinutes: number;
    capacity: number;
    price: number;
    description?: string;
    status?: string;
  }) => {
    if (!training) return;

    const updateData: UpdateTrainingDto = {
      title: data.title,
      type: data.type as UpdateTrainingDto['type'],
      trainerId: data.trainerId,
      scheduledAt: data.scheduledAt.toISOString(),
      durationMinutes: data.durationMinutes,
      capacity: data.capacity,
      price: data.price,
      description: data.description,
    };

    if (data.status) {
      updateData.status = data.status as UpdateTrainingDto['status'];
    }

    updateTraining.mutate(
      {id, data: updateData},
      {
        onSuccess: handleSuccess,
        onError: error => {
          const message =
            error instanceof Error
              ? error.message
              : 'Ошибка при обновлении тренировки';
          toast.error(message);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Редактирование тренировки"
        description="Измените данные тренировки и нажмите 'Сохранить'"
        showBack
        onBack={handleCancel}
      />

      {trainingLoading ? (
        <div className="rounded-lg border p-6">
          <div className="space-y-4">
            <div className="h-10 w-full animate-pulse rounded-sm bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-sm bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-sm bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-sm bg-muted" />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border p-6">
          <TrainingForm
            training={training}
            trainers={trainers}
            onSuccess={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  );
};
