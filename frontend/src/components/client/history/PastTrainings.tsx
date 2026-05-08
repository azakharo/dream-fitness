import * as React from 'react';

import {Badge, Skeleton} from '@/components/ui';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {useEnrichedBookings} from '@/hooks';
import {formatDateShort, formatTime} from '@/lib/date-utils';

interface TrainingItemProps {
  trainingTitle: string;
  scheduledAt: string;
  trainerName?: string;
  status: 'confirmed' | 'cancelled';
}

const TrainingItem: React.FC<TrainingItemProps> = ({
  trainingTitle,
  scheduledAt,
  trainerName,
  status,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800">✓ Посещено</Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            ✗ Отменено
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
        {getStatusBadge()}
      </div>
      {trainerName && (
        <p className="mt-1 text-sm text-muted-foreground">
          Тренер: {trainerName}
        </p>
      )}
    </div>
  );
};

interface PastTrainingsProps {
  isLoading?: boolean;
}

export const PastTrainings: React.FC<PastTrainingsProps> = ({
  isLoading: isExternalLoading,
}) => {
  const {data: bookings, isLoading: isInternalLoading} = useEnrichedBookings({
    past: true,
  });

  const isLoading = isExternalLoading || isInternalLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Прошедшие тренировки</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Прошедшие тренировки</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Нет прошедших тренировок</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Прошедшие тренировки</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {bookings.map(booking => (
          <TrainingItem
            key={booking.id}
            trainingTitle={booking.trainingTitle}
            scheduledAt={booking.scheduledAt}
            trainerName={booking.trainerName}
            status={booking.status}
          />
        ))}
      </CardContent>
    </Card>
  );
};
