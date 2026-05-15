import {useState} from 'react';
import {Plus} from 'lucide-react';

import {PageHeader} from '@/components/common/PageHeader';
import {TrainersTable} from '@/components/admin/trainers/TrainersTable';
import {TrainerForm} from '@/components/admin/trainers/TrainerForm';
import {TrainerDeleteDialog} from '@/components/admin/trainers/TrainerDeleteDialog';
import {Button} from '@/components/ui';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui';
import {Skeleton} from '@/components/ui';
import type {TrainerResponseDto} from '@/types';
import {useTrainers, useDeleteTrainer} from '@/hooks/use-trainers';

export const AdminTrainersPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] =
    useState<TrainerResponseDto | null>(null);

  const {data: trainers = [], isLoading} = useTrainers();
  const deleteTrainer = useDeleteTrainer();

  const handleAddTrainer = () => {
    setSelectedTrainer(null);
    setIsFormOpen(true);
  };

  const handleEditTrainer = (trainer: TrainerResponseDto) => {
    setSelectedTrainer(trainer);
    setIsFormOpen(true);
  };

  const handleDeleteTrainer = (trainer: TrainerResponseDto) => {
    setSelectedTrainer(trainer);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedTrainer(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedTrainer) {
      deleteTrainer.mutate(selectedTrainer.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedTrainer(null);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Тренеры"
        description="Управление тренерами фитнес-клуба"
        actions={
          <Button onClick={handleAddTrainer}>
            <Plus className="mr-2 size-4" />
            Добавить тренера
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <TrainersTable
          trainers={trainers}
          onEdit={handleEditTrainer}
          onDelete={handleDeleteTrainer}
        />
      )}

      {/* Create/Edit Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {selectedTrainer ? 'Редактирование тренера' : 'Новый тренер'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <TrainerForm
              trainer={selectedTrainer ?? undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <TrainerDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        trainer={selectedTrainer}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteTrainer.isPending}
      />
    </div>
  );
};
