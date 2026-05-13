import React from 'react';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';

import {Badge} from '@/components/ui/Badge';
import {Button} from '@/components/ui/Button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {Skeleton} from '@/components/ui/Skeleton';
import type {BookingStatus} from '@/types';

interface UserBookingsListProps {
  userId: string;
  limit?: number;
}

interface MockBooking {
  id: string;
  trainingName: string;
  scheduledAt: string;
  status: BookingStatus;
}

const mockBookings: MockBooking[] = [
  {
    id: '1',
    trainingName: 'Yoga',
    scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'confirmed',
  },
  {
    id: '2',
    trainingName: 'CrossFit',
    scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
  },
  {
    id: '3',
    trainingName: 'Boxing',
    scheduledAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'cancelled',
  },
  {
    id: '4',
    trainingName: 'Pilates',
    scheduledAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
  },
  {
    id: '5',
    trainingName: 'Strength',
    scheduledAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'cancelled',
  },
];

const formatBookingDateTime = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'dd MMM HH:mm', {locale: ru});
  } catch {
    return '—';
  }
};

const getStatusBadgeVariant = (
  status: BookingStatus,
): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch (status) {
    case 'confirmed':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'cancelled':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: BookingStatus): string => {
  switch (status) {
    case 'confirmed':
      return 'записан';
    case 'completed':
      return 'посещено';
    case 'cancelled':
      return 'отменено';
    default:
      return status;
  }
};

export const UserBookingsList: React.FC<UserBookingsListProps> = ({
  userId,
  limit = 5,
}) => {
  // TODO: Replace mock data with actual API call when endpoint is available
  void userId;
  const [showAll, setShowAll] = React.useState(false);
  const isLoading = false;

  const displayedBookings = showAll
    ? mockBookings
    : mockBookings.slice(0, limit);

  const hasMore = mockBookings.length > limit;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (mockBookings.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Последние тренировки (mock)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Нет записей</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Последние тренировки (mock)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedBookings.map(booking => (
          <div key={booking.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {booking.trainingName},{' '}
                {formatBookingDateTime(booking.scheduledAt)}
              </span>
            </div>
            <Badge variant={getStatusBadgeVariant(booking.status)}>
              {getStatusLabel(booking.status)}
            </Badge>
          </div>
        ))}
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="mt-2 w-full"
          >
            {showAll ? 'Скрыть' : 'Показать ещё →'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
