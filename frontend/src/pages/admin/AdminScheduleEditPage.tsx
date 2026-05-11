import React from 'react';
import {useNavigate, useParams} from '@tanstack/react-router';

import {PageHeader} from '@/components/common/PageHeader';
import {TrainingForm} from '@/components/admin/trainings/TrainingForm';
import {
  useTraining,
  useCreateTraining,
  useUpdateTraining,
} from '@/hooks/use-trainings';
import {useTrainers} from '@/hooks/use-trainers';
import type {CreateTrainingDto, UpdateTrainingDto} from '@/types';
import {ROUTES} from '@/lib/routes';

export const AdminScheduleEditPage: React.FC = () => {
  const navigate = useNavigate();
  const {id} = useParams({from: '/admin/schedule/$id'});
  const isEditMode = id !== 'new';

  const {data: training, isLoading: trainingLoading} = useTraining(id);
  const {data: trainersData} = useTrainers({activeOnly: true});
  const createTraining = useCreateTraining();
  const updateTraining = useUpdateTraining();

  const trainers = trainersData ?? [];

  const handleSuccess = () => {
    void navigate({to: ROUTES.ADMIN_SCHEDULE});
  };

  const handleCancel = () => {
    void navigate({to: ROUTES.ADMIN_SCHEDULE});
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
    const trainingData = {
      title: data.title,
      type: data.type as CreateTrainingDto['type'],
      trainerId: data.trainerId,
      scheduledAt: data.scheduledAt.toISOString(),
      durationMinutes: data.durationMinutes,
      capacity: data.capacity,
      price: data.price,
      description: data.description,
    };

    if (isEditMode && training) {
      const updateData: UpdateTrainingDto = {
        ...trainingData,
      };
      if (data.status) {
        updateData.status = data.status as UpdateTrainingDto['status'];
      }
      updateTraining.mutate(
        {id, data: updateData},
        {
          onSuccess: handleSuccess,
        },
      );
    } else {
      createTraining.mutate(trainingData as CreateTrainingDto, {
        onSuccess: handleSuccess,
      });
    }
  };

  const isLoading = isEditMode && trainingLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? 'Редактирование тренировки' : 'Создание тренировки'}
        description={
          isEditMode
            ? 'Измените данные тренировки и нажмите "Сохранить"'
            : 'Заполните данные тренировки и нажмите "Создать"'
        }
        showBack
        onBack={handleCancel}
      />

      {isLoading ? (
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
