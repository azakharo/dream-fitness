import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui';
import type {TrainerResponseDto} from '@/types';

interface TrainerDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer: TrainerResponseDto | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const TrainerDeleteDialog: React.FC<TrainerDeleteDialogProps> = ({
  open,
  onOpenChange,
  trainer,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Деактивация тренера</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите деактивировать тренера "{trainer?.name}
            "?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p className="text-sm text-muted-foreground">
          Тренер не будет доступен для назначения на новые тренировки.
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Деактивация...' : 'Деактивировать'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
