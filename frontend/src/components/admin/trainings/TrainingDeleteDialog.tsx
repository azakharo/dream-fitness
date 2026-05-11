import React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import type {TrainingResponseDto} from '@/types';

interface TrainingDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training: TrainingResponseDto | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const TrainingDeleteDialog: React.FC<TrainingDeleteDialogProps> = ({
  open,
  onOpenChange,
  training,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Отмена тренировки</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите отменить тренировку "{training?.title}"?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p className="text-sm text-muted-foreground">
          Все записавшиеся пользователи получат возврат баллов. Это действие
          нельзя отменить.
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Отмена...' : 'Отменить тренировку'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
