import * as React from 'react';

import {Bell, Inbox} from 'lucide-react';
import {useNotifications} from '@/hooks/use-notifications';
import {NotificationItem} from '@/components/client/notifications/NotificationItem';
import {NotificationFilters} from '@/components/client/notifications/NotificationFilters';
import {Card, CardContent} from '@/components/ui/Card';
import {Skeleton} from '@/components/ui/Skeleton';
import type {NotificationResponseDto, NotificationType} from '@/types';

export const NotificationsPage: React.FC = () => {
  const [selectedType, setSelectedType] = React.useState<
    NotificationType | undefined
  >(undefined);
  const {data, isLoading} = useNotifications();

  const notifications = React.useMemo<NotificationResponseDto[]>(() => {
    if (!data) return [];
    if (!selectedType) return data.items;
    return data.items.filter(n => n.type === selectedType);
  }, [data, selectedType]);

  const handleMarkAsRead = (notificationId: string) => {
    // TODO: Implement mark as read mutation
    console.log('Mark as read:', notificationId);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Bell className="size-6" />
          Уведомления
        </h1>
        <p className="text-muted-foreground">Все ваши уведомления</p>
      </div>

      <NotificationFilters
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-4 w-3/4" />
                    <Skeleton className="mb-2 h-3 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Inbox className="mx-auto mb-4 size-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">Нет уведомлений</h3>
            <p className="text-sm text-muted-foreground">
              {selectedType
                ? 'Нет уведомлений выбранного типа'
                : 'У вас пока нет уведомлений'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={() => handleMarkAsRead(notification.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
