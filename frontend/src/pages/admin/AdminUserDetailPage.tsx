import React, {useState} from 'react';

import {PageHeader} from '@/components/common/PageHeader';
import {BlockUserDialog} from '@/components/admin/users/BlockUserDialog';
import {UserBookingsList} from '@/components/admin/users/UserBookingsList';
import {UserInfoCard} from '@/components/admin/users/UserInfoCard';
import {UserTransactionsList} from '@/components/admin/users/UserTransactionsList';
import {useBlockUser, useUnblockUser, useUser} from '@/hooks/use-users';
import {ROUTES} from '@/lib/routes';

export const AdminUserDetailPage: React.FC = () => {
  const userId = window.location.pathname
    .split('/admin/users/')[1]
    ?.split('?')[0];
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockAction, setBlockAction] = useState<'block' | 'unblock'>('block');

  const {data: user, isLoading, error} = useUser(userId || '');
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  const handleBlock = () => {
    setBlockAction('block');
    setBlockDialogOpen(true);
  };

  const handleUnblock = () => {
    setBlockAction('unblock');
    setBlockDialogOpen(true);
  };

  const handleConfirmBlock = () => {
    if (userId && blockAction === 'block') {
      void blockUserMutation.mutateAsync(userId);
    } else if (userId && blockAction === 'unblock') {
      void unblockUserMutation.mutateAsync(userId);
    }
    setBlockDialogOpen(false);
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <PageHeader
          title="Детали пользователя"
          showBack
          onBack={() => {
            window.location.href = ROUTES.USERS;
          }}
        />
        <div
          className="
            rounded-lg border border-destructive bg-destructive/10 p-6
            text-center
          "
        >
          <p className="text-destructive">Пользователь не найден</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Детали пользователя"
        showBack
        onBack={() => {
          window.location.href = ROUTES.USERS;
        }}
      />

      {user && (
        <>
          <div className="mb-6">
            <UserInfoCard
              user={user}
              isLoading={isLoading}
              onBlock={handleBlock}
              onUnblock={handleUnblock}
            />
          </div>

          <div
            className="
              grid gap-6
              md:grid-cols-2
            "
          >
            <UserTransactionsList userId={user.id} limit={5} />
            <UserBookingsList userId={user.id} limit={5} />
          </div>
        </>
      )}

      <BlockUserDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        user={user || null}
        action={blockAction}
        onConfirm={handleConfirmBlock}
        isLoading={blockUserMutation.isPending || unblockUserMutation.isPending}
      />
    </div>
  );
};
