import React from 'react';
import {format, parseISO} from 'date-fns';
import {ru} from 'date-fns/locale';
import {Users, Pencil, Trash} from 'lucide-react';

import {Badge} from '@/components/ui/Badge';
import {Button} from '@/components/ui/Button';
import type {TrainingResponseDto} from '@/types';
import {TRAINING_TYPE_OPTIONS} from '@/types/constants';

interface TrainingsTableProps {
  trainings: TrainingResponseDto[];
  isLoading?: boolean;
  onEdit: (training: TrainingResponseDto) => void;
  onDelete: (training: TrainingResponseDto) => void;
  onViewParticipants: (training: TrainingResponseDto) => void;
}

const getStatusBadgeVariant = (
  status: TrainingResponseDto['status'],
): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch (status) {
    case 'scheduled':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: TrainingResponseDto['status']): string => {
  switch (status) {
    case 'scheduled':
      return 'Запланирована';
    case 'completed':
      return 'Завершена';
    case 'cancelled':
      return 'Отменена';
    default:
      return status;
  }
};

const getTypeLabel = (type: TrainingResponseDto['type']): string => {
  const option = TRAINING_TYPE_OPTIONS.find(o => o.value === type);
  return option?.label ?? type;
};

const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'd MMM yyyy, HH:mm', {locale: ru});
  } catch {
    return dateString;
  }
};

export const TrainingsTable: React.FC<TrainingsTableProps> = ({
  trainings,
  isLoading,
  onEdit,
  onDelete,
  onViewParticipants,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="divide-y divide-border">
          {Array.from({length: 5}).map((_, index) => (
            // eslint-disable-next-line react-x/no-array-index-key
            <div key={index} className="flex items-center gap-4 p-4">
              <div className="h-4 w-20 animate-pulse rounded-sm bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded-sm bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded-sm bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded-sm bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded-sm bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded-sm bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded-sm bg-muted" />
              <div className="ml-auto flex gap-2">
                <div className="size-8 animate-pulse rounded-sm bg-muted" />
                <div className="size-8 animate-pulse rounded-sm bg-muted" />
                <div className="size-8 animate-pulse rounded-sm bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (trainings.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex h-32 items-center justify-center">
          <span className="text-muted-foreground">Тренировки не найдены</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">
                Название
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Тип</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Тренер
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Дата/Время
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Места</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Лист ожидания
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Статус
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trainings.map(training => {
              const isFull = training.availableSlots === 0;
              const hasWaitlist = training.waitlistCount > 0;

              return (
                <tr key={training.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">{training.title}</td>
                  <td className="px-4 py-3 text-sm">
                    {getTypeLabel(training.type)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {training.trainerName ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatDateTime(training.scheduledAt)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {training.currentParticipants}/{training.capacity}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {isFull && hasWaitlist ? training.waitlistCount : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={getStatusBadgeVariant(training.status)}>
                      {getStatusLabel(training.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewParticipants(training)}
                        title="Посмотреть участников"
                      >
                        <Users className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(training)}
                        title="Редактировать"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(training)}
                        title="Отменить тренировку"
                      >
                        <Trash className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
