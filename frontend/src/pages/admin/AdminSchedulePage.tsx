import React, {useState} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {Plus} from 'lucide-react';

import {PageHeader} from '@/components/common/PageHeader';
import {TrainingFilters} from '@/components/admin/trainings/TrainingFilters';
import {TrainingsTable} from '@/components/admin/trainings/TrainingsTable';
import {ParticipantsDrawer} from '@/components/admin/trainings/ParticipantsDrawer';
import {TrainingDeleteDialog} from '@/components/admin/trainings/TrainingDeleteDialog';
import {Button} from '@/components/ui/Button';
import {
  useTrainings,
  useDeleteTraining,
  useTrainingParticipants,
  type TrainingFilters as TrainingFiltersType,
} from '@/hooks/use-trainings';
import {useTrainers} from '@/hooks/use-trainers';
import type {TrainingResponseDto} from '@/types';
import {ROUTES} from '@/lib/routes';

export const AdminSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TrainingFiltersType>({});
  const [selectedTraining, setSelectedTraining] =
    useState<TrainingResponseDto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [participantsDrawerOpen, setParticipantsDrawerOpen] = useState(false);

  const {data: trainingsData, isLoading: trainingsLoading} =
    useTrainings(filters);
  const {data: trainersData} = useTrainers({activeOnly: true});
  const deleteTraining = useDeleteTraining();

  const {data: participantsData, isLoading: participantsLoading} =
    useTrainingParticipants(selectedTraining?.id ?? '');

  const handleEdit = (training: TrainingResponseDto) => {
    void navigate({
      to: ROUTES.ADMIN_SCHEDULE_EDIT,
      params: {id: training.id},
    });
  };

  const handleDelete = (training: TrainingResponseDto) => {
    setSelectedTraining(training);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTraining) {
      deleteTraining.mutate(selectedTraining.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedTraining(null);
        },
      });
    }
  };

  const handleViewParticipants = (training: TrainingResponseDto) => {
    setSelectedTraining(training);
    setParticipantsDrawerOpen(true);
  };

  const handleCreateTraining = () => {
    void navigate({to: ROUTES.ADMIN_SCHEDULE_NEW});
  };

  const trainings = trainingsData?.items ?? [];
  const trainers = trainersData ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Расписание тренировок"
        description="Управление расписанием и тренировками"
        actions={
          <Button onClick={handleCreateTraining}>
            <Plus className="mr-2 size-4" />
            Создать тренировку
          </Button>
        }
      />

      <TrainingFilters
        filters={filters}
        onFiltersChange={setFilters}
        trainers={trainers}
      />

      <TrainingsTable
        trainings={trainings}
        isLoading={trainingsLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewParticipants={handleViewParticipants}
      />

      {selectedTraining && (
        <ParticipantsDrawer
          open={participantsDrawerOpen}
          onOpenChange={setParticipantsDrawerOpen}
          training={selectedTraining}
          participants={participantsData ?? []}
          isLoading={participantsLoading}
        />
      )}

      <TrainingDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        training={selectedTraining}
        onConfirm={handleConfirmDelete}
        isLoading={deleteTraining.isPending}
      />
    </div>
  );
};
