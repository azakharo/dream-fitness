import React from 'react';
import {format, parseISO} from 'date-fns';
import {ru} from 'date-fns/locale';
import {Eye, Lock, Unlock} from 'lucide-react';

import {Badge} from '@/components/ui/Badge';
import {Button} from '@/components/ui/Button';
import {
  DataTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@/components/common/DataTable';
import type {UserDto} from '@/types';

interface UsersTableProps {
  users: UserDto[];
  isLoading?: boolean;
  pagination: PaginationState;
  onPaginationChange: (pagination: {page: number; pageSize: number}) => void;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  selectedRows: Set<string>;
  onSelectedRowsChange: (selectedRows: Set<string>) => void;
  onView: (user: UserDto) => void;
  onBlock: (user: UserDto) => void;
  onUnblock: (user: UserDto) => void;
}

const formatBalance = (balance: number): string => {
  return balance.toLocaleString('ru-RU');
};

const formatPhone = (phone: UserDto['phone']): string => {
  if (!phone || typeof phone !== 'string') return '—';
  return phone;
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';
  try {
    const date = parseISO(dateString);
    return format(date, 'd MMM yyyy', {locale: ru});
  } catch {
    return dateString;
  }
};

const getStatusBadgeVariant = (
  status: UserDto['status'],
): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch (status) {
    case 'active':
      return 'default';
    case 'blocked':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: UserDto['status']): string => {
  switch (status) {
    case 'active':
      return 'Активен';
    case 'blocked':
      return 'Заблокирован';
    default:
      return status;
  }
};

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  selectedRows,
  onSelectedRowsChange,
  onView,
  onBlock,
  onUnblock,
}) => {
  const columns: ColumnDef<UserDto>[] = [
    {
      key: 'name',
      header: 'Имя',
      render: user => <span className="font-medium">{user.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'phone',
      header: 'Телефон',
      render: user => formatPhone(user.phone),
    },
    {
      key: 'balance',
      header: 'Баланс',
      render: user => (
        <span className="font-mono">{formatBalance(user.balance)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Статус',
      render: user => (
        <Badge variant={getStatusBadgeVariant(user.status)}>
          {getStatusLabel(user.status)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Дата регистрации',
      render: user => (
        <span className="text-muted-foreground">
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Действия',
      width: '120px',
      render: user => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={e => {
              e.stopPropagation();
              onView(user);
            }}
            title="Посмотреть"
          >
            <Eye className="size-4" />
          </Button>
          {user.status === 'blocked' ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={e => {
                e.stopPropagation();
                onUnblock(user);
              }}
              title="Разблокировать"
            >
              <Unlock className="size-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={e => {
                e.stopPropagation();
                onBlock(user);
              }}
              title="Заблокировать"
            >
              <Lock className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      selectedRows={selectedRows}
      onSelectedRowsChange={onSelectedRowsChange}
      rowIdKey="id"
      onRowClick={onView}
      isLoading={isLoading}
      emptyMessage="Пользователи не найдены"
    />
  );
};
