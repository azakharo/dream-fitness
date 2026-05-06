import * as React from 'react';
import {toast} from 'sonner';

import {Button, Skeleton} from '@/components/ui';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {useEnrichedWaitlist, useLeaveWaitlist} from '@/hooks';
import {formatDateShort, formatTime} from '@/lib/date-utils';

interface WaitlistItemProps {
  id: string;
  trainingId: string;
  trainingTitle: string;
  scheduledAt: string;
  trainerName?: string;
  position: number;
  onLeave: (trainingId: string) => Promise<void>;
  isLeaving: boolean;
}

const WaitlistItem: React.FC<WaitlistItemProps> = ({
  id,
  trainingTitle,
  scheduledAt,
  trainerName,
  position,
  onLeave,
  isLeaving,
}) => {
  const handleLeave = () => {
    if (window.confirm('Вы уверены, что хотите выйти из очереди?')) {
      void onLeave(id);
    }
  };

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">{trainingTitle}</span>
          <span className="text-muted-foreground">
            {' • '}
            {formatDateShort(scheduledAt)}
            {', '}
            {formatTime(scheduledAt)}
          </span>
        </div>
      </div>
      {trainerName && (
        <p className="mt-1 text-sm text-muted-foreground">
          Тренер: {trainerName}
        </p>
      )}
      <p className="mt-1 text-sm font-medium">Позиция в очереди: {position}</p>
      <div className="mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLeave}
          disabled={isLeaving}
        >
          {isLeaving ? 'Выход...' : 'Выйти из очереди'}
        </Button>
      </div>
    </div>
  );
};

interface WaitlistPositionsProps {
  isLoading?: boolean;
}

export const WaitlistPositions: React.FC<WaitlistPositionsProps> = ({
  isLoading: isExternalLoading,
}) => {
  const {data: waitlist, isLoading: isInternalLoading} = useEnrichedWaitlist();
  const leaveWaitlist = useLeaveWaitlist();

  const handleLeave = async (trainingId: string) => {
    try {
      await leaveWaitlist.mutateAsync(trainingId);
      toast.success('Вы вышли из очереди');
    } catch {
      toast.error('Не удалось выйти из очереди');
    }
  };

  const isLoading = isExternalLoading || isInternalLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Лист ожидания</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!waitlist || waitlist.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Лист ожидания</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Нет активных записей в очереди
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Лист ожидания</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {waitlist.map(item => (
          <WaitlistItem
            key={item.id}
            id={item.id}
            trainingId={item.trainingId}
            trainingTitle={item.trainingTitle}
            scheduledAt={item.scheduledAt}
            trainerName={item.trainerName}
            position={item.position}
            onLeave={handleLeave}
            isLeaving={
              leaveWaitlist.isPending &&
              leaveWaitlist.variables === item.trainingId
            }
          />
        ))}
      </CardContent>
    </Card>
  );
};
