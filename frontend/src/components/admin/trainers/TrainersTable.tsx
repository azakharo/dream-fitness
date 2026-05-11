import {Pencil, Trash2} from 'lucide-react';
import {format} from 'date-fns';

import {DataTable} from '@/components/common/DataTable';
import type {ColumnDef} from '@/components/common/DataTable';
import {Badge} from '@/components/ui/Badge';
import {Button} from '@/components/ui/Button';
import type {TrainerResponseDto} from '@/types';

interface TrainersTableProps {
  trainers: TrainerResponseDto[];
  isLoading?: boolean;
  onEdit: (trainer: TrainerResponseDto) => void;
  onDelete: (trainer: TrainerResponseDto) => void;
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

interface SortingState {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const getBioDisplay = (bio: TrainerResponseDto['bio']): string => {
  if (!bio || typeof bio !== 'string') return '—';
  return bio;
};

export const TrainersTable: React.FC<TrainersTableProps> = ({
  trainers,
  isLoading = false,
  onEdit,
  onDelete,
}) => {
  const columns: ColumnDef<TrainerResponseDto>[] = [
    {
      key: 'name',
      header: 'Имя',
      sortable: true,
    },
    {
      key: 'bio',
      header: 'Биография',
      render: (trainer: TrainerResponseDto) => {
        const bioDisplay = getBioDisplay(trainer.bio);
        if (bioDisplay === '—') {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <span className="block max-w-xs truncate" title={bioDisplay}>
            {bioDisplay}
          </span>
        );
      },
    },
    {
      key: 'isActive',
      header: 'Статус',
      render: (trainer: TrainerResponseDto) => (
        <Badge variant={trainer.isActive ? 'default' : 'secondary'}>
          {trainer.isActive ? 'Активен' : 'Неактивен'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Создан',
      render: (trainer: TrainerResponseDto) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(trainer.createdAt), 'dd.MM.yyyy')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Действия',
      render: (trainer: TrainerResponseDto) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={e => {
              e.stopPropagation();
              onEdit(trainer);
            }}
            aria-label="Редактировать тренера"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={e => {
              e.stopPropagation();
              onDelete(trainer);
            }}
            aria-label="Деактивировать тренера"
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const pagination: PaginationState = {
    page: 1,
    pageSize: 10,
    total: trainers.length,
  };

  const sorting: SortingState = {
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };

  return (
    <DataTable
      columns={columns}
      data={trainers}
      pagination={pagination}
      onPaginationChange={() => {}}
      sorting={sorting}
      onSortingChange={() => {}}
      selectedRows={new Set()}
      onSelectedRowsChange={() => {}}
      rowIdKey="id"
      isLoading={isLoading}
      emptyMessage="Тренеры не найдены"
    />
  );
};
