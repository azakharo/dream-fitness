import React from 'react';
import {useRouter} from '@tanstack/react-router';
import {toast} from 'sonner';

import {PageHeader} from '@/components/common/PageHeader';
import {TrainingForm} from '@/components/admin/trainings/TrainingForm';
import {useCreateTraining} from '@/hooks/use-trainings';
import {useTrainers} from '@/hooks/use-trainers';
import type {CreateTrainingDto} from '@/types';

export const AdminScheduleCreatePage: React.FC = () => {
  const router = useRouter();
  const {data: trainersData} = useTrainers({activeOnly: true});
  const createTraining = useCreateTraining();

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
    const trainingData: CreateTrainingDto = {
      title: data.title,
      type: data.type as CreateTrainingDto['type'],
      trainerId: data.trainerId,
      scheduledAt: data.scheduledAt.toISOString(),
      durationMinutes: data.durationMinutes,
      capacity: data.capacity,
      price: data.price,
      description: data.description,
    };

    createTraining.mutate(trainingData, {
      onSuccess: handleSuccess,
      onError: error => {
        const message =
          error instanceof Error
            ? error.message
            : 'Ошибка при создании тренировки';
        toast.error(message);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Создание тренировки"
        description="Заполните данные тренировки и нажмите 'Создать'"
        showBack
        onBack={handleCancel}
      />

      <div className="rounded-lg border p-6">
        <TrainingForm
          trainers={trainers}
          onSuccess={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};
