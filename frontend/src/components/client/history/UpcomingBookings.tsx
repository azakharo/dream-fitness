import * as React from 'react';
import {toast} from 'sonner';

import {Button, Skeleton} from '@/components/ui';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {useCancelBooking, useEnrichedBookings} from '@/hooks';

interface BookingItemProps {
  id: string;
  trainingTitle: string;
  scheduledAt: string;
  trainerName?: string;
  onCancel: (id: string) => Promise<void>;
  isCancelling: boolean;
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
};

const formatTime = (date: string): string => {
  return new Date(date).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const BookingItem: React.FC<BookingItemProps> = ({
  id,
  trainingTitle,
  scheduledAt,
  trainerName,
  onCancel,
  isCancelling,
}) => {
  const handleCancel = () => {
    if (window.confirm('Вы уверены, что хотите отменить бронирование?')) {
      void onCancel(id);
    }
  };

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">{trainingTitle}</span>
          <span className="text-muted-foreground">
            {' • '}
            {formatDate(scheduledAt)}
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
      <div className="mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isCancelling}
        >
          {isCancelling ? 'Отмена...' : 'Отменить'}
        </Button>
      </div>
    </div>
  );
};

interface UpcomingBookingsProps {
  isLoading?: boolean;
}

export const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({
  isLoading: isExternalLoading,
}) => {
  const {data: bookings, isLoading: isInternalLoading} = useEnrichedBookings({
    upcoming: true,
  });

  const cancelBooking = useCancelBooking();

  const handleCancel = async (id: string) => {
    try {
      await cancelBooking.mutateAsync({id});
      toast.success('Бронирование отменено');
    } catch {
      toast.error('Не удалось отменить бронирование');
    }
  };

  const isLoading = isExternalLoading || isInternalLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Предстоящие тренировки</CardTitle>
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
          <CardTitle>Предстоящие тренировки</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Нет предстоящих тренировок</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Предстоящие тренировки</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {bookings.map(booking => (
          <BookingItem
            key={booking.id}
            id={booking.id}
            trainingTitle={booking.trainingTitle}
            scheduledAt={booking.scheduledAt}
            trainerName={booking.trainerName}
            onCancel={handleCancel}
            isCancelling={
              cancelBooking.isPending &&
              cancelBooking.variables?.id === booking.id
            }
          />
        ))}
      </CardContent>
    </Card>
  );
};
