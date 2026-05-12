import * as React from 'react';
import {Check, X, UserPlus, ChevronRight} from 'lucide-react';
import {formatDistanceToNow} from 'date-fns';
import {Card} from '@/components/ui/Card';
import {Skeleton} from '@/components/ui/Skeleton';

export interface Activity {
  id: string;
  type: 'booking' | 'cancellation' | 'registration';
  userName: string;
  description: string;
  timestamp: Date;
}

export interface RecentActivityProps {
  limit?: number;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'booking',
    userName: 'Иван П.',
    description: 'записался на Yoga',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: '2',
    type: 'cancellation',
    userName: 'Мария С.',
    description: 'отменила CrossFit',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: '3',
    type: 'registration',
    userName: 'Алексей',
    description: 'новый пользователь',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: '4',
    type: 'booking',
    userName: 'Дмитрий К.',
    description: 'записался на Boxing',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '5',
    type: 'booking',
    userName: 'Елена Н.',
    description: 'записалась на Pilates',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: '6',
    type: 'cancellation',
    userName: 'Андрей В.',
    description: 'отменил Morning Yoga',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: '7',
    type: 'registration',
    userName: 'Ольга',
    description: 'новый пользователь',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    id: '8',
    type: 'booking',
    userName: 'Сергей М.',
    description: 'записался на Strength Training',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'booking':
      return <Check className="size-4 text-green-600" />;
    case 'cancellation':
      return <X className="size-4 text-red-600" />;
    case 'registration':
      return <UserPlus className="size-4 text-blue-600" />;
  }
};

export const RecentActivity: React.FC<RecentActivityProps> = ({limit = 10}) => {
  const activities = mockActivities.slice(0, limit);

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Последние действия (mock)</h3>
        <button
          className="
            flex items-center gap-1 text-sm text-muted-foreground
            transition-colors
            hover:text-foreground
          "
        >
          Все
          <ChevronRight className="size-4" />
        </button>
      </div>

      {activities.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          Нет последних действий
        </p>
      ) : (
        <div className="space-y-3">
          {activities.map(activity => (
            <div
              key={activity.id}
              className="
                flex items-center justify-between gap-4 border-b py-2
                last:border-0
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="shrink-0">{getActivityIcon(activity.type)}</div>
                <p className="truncate text-sm">
                  <span className="font-medium">{activity.userName}</span>{' '}
                  {activity.description}
                </p>
              </div>
              <span className="text-xs whitespace-nowrap text-muted-foreground">
                {formatDistanceToNow(activity.timestamp, {addSuffix: true})}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export const RecentActivitySkeleton: React.FC = () => {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-3">
              <Skeleton className="size-4" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </Card>
  );
};
