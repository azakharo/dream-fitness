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
} from '@/components/ui';
import type {UserDto} from '@/types';

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDto | null;
  action: 'block' | 'unblock';
  onConfirm: () => void;
  isLoading?: boolean;
}

export const BlockUserDialog: React.FC<BlockUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  action,
  onConfirm,
  isLoading = false,
}) => {
  const isBlocking = action === 'block';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBlocking
              ? 'Блокировка пользователя'
              : 'Разблокировка пользователя'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите{' '}
            {isBlocking ? 'заблокировать' : 'разблокировать'} пользователя "
            {user?.name}"?
          </AlertDialogDescription>
        </AlertDialogHeader>
        {isBlocking ? (
          <p className="text-sm text-muted-foreground">
            Пользователь не сможет войти в систему и записываться на тренировки.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Пользователь снова сможет входить в систему и записываться на
            тренировки.
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={
              isBlocking
                ? `
                  bg-destructive
                  hover:bg-destructive/90
                `
                : undefined
            }
          >
            {isLoading
              ? isBlocking
                ? 'Блокировка...'
                : 'Разблокировка...'
              : isBlocking
                ? 'Заблокировать'
                : 'Разблокировать'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
