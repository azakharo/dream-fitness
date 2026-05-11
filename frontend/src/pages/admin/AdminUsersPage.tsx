import React, {useState} from 'react';

import {PageHeader} from '@/components/common/PageHeader';
import {UserFilters} from '@/components/admin/users/UserFilters';
import {UsersTable} from '@/components/admin/users/UsersTable';
import {BlockUserDialog} from '@/components/admin/users/BlockUserDialog';
import {
  useUsers,
  useBlockUser,
  useUnblockUser,
  type UserFilters as UserFiltersType,
} from '@/hooks/use-users';
import type {UserDto} from '@/types';
import type {SortingState} from '@/components/common/DataTable';

export const AdminUsersPage: React.FC = () => {
  const [filters, setFilters] = useState<UserFiltersType>({});
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockAction, setBlockAction] = useState<'block' | 'unblock'>('block');

  const [pagination, setPagination] = useState({page: 1, pageSize: 10});
  const [sorting, setSorting] = useState<SortingState>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const {data: usersData, isLoading: usersLoading} = useUsers({
    ...filters,
    page: pagination.page,
    limit: pagination.pageSize,
  });

  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  const handleView = (user: UserDto) => {
    window.location.href = `/admin/users/${user.id}`;
  };

  const handleBlock = (user: UserDto) => {
    setSelectedUser(user);
    setBlockAction('block');
    setBlockDialogOpen(true);
  };

  const handleUnblock = (user: UserDto) => {
    setSelectedUser(user);
    setBlockAction('unblock');
    setBlockDialogOpen(true);
  };

  const handleConfirmBlock = () => {
    if (selectedUser) {
      if (blockAction === 'block') {
        blockUser.mutate(selectedUser.id, {
          onSuccess: () => {
            setBlockDialogOpen(false);
            setSelectedUser(null);
          },
        });
      } else {
        unblockUser.mutate(selectedUser.id, {
          onSuccess: () => {
            setBlockDialogOpen(false);
            setSelectedUser(null);
          },
        });
      }
    }
  };

  const users = usersData?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Пользователи"
        description="Управление пользователями системы"
      />

      <UserFilters filters={filters} onFiltersChange={setFilters} />

      <UsersTable
        users={users}
        isLoading={usersLoading}
        pagination={{...pagination, total: usersData?.total ?? 0}}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        onView={handleView}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
      />

      <BlockUserDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        user={selectedUser}
        action={blockAction}
        onConfirm={handleConfirmBlock}
        isLoading={blockUser.isPending || unblockUser.isPending}
      />
    </div>
  );
};
