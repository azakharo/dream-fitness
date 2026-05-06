import {Calendar, X, Coins, Bell, Users, Check} from 'lucide-react';
import type {NotificationResponseDto, NotificationType} from '@/types';
import {Card, CardContent} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {Badge} from '@/components/ui/Badge';

interface NotificationItemProps {
  notification: NotificationResponseDto;
  onMarkAsRead?: () => void;
}

const NOTIFICATION_TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
  booking_confirmation: <Calendar className="size-5 text-blue-500" />,
  booking_cancellation: <X className="size-5 text-red-500" />,
  balance_change: <Coins className="size-5 text-green-500" />,
  training_reminder: <Bell className="size-5 text-yellow-500" />,
  waitlist_joined: <Users className="size-5 text-purple-500" />,
  waitlist_promoted: <Users className="size-5 text-purple-500" />,
};

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  booking_confirmation: 'Бронирование',
  booking_cancellation: 'Отмена',
  balance_change: 'Транзакция',
  training_reminder: 'Напоминание',
  waitlist_joined: 'Лист ожидания',
  waitlist_promoted: 'Лист ожидания',
};

const getRelativeTime = (date: string): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays === 1) return 'вчера';
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return then.toLocaleDateString('ru-RU');
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const icon = NOTIFICATION_TYPE_ICONS[notification.type];
  const label = NOTIFICATION_TYPE_LABELS[notification.type];

  return (
    <Card
      className={`
        transition-colors
        ${
          notification.isRead
            ? `
              bg-white
              hover:bg-gray-50
            `
            : `
              bg-blue-50/50
              hover:bg-blue-50
            `
        }
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">{icon}</div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              {!notification.isRead && (
                <span className="size-2 shrink-0 rounded-full bg-blue-500" />
              )}
              <h3
                className={`
                  text-sm
                  ${
                    notification.isRead
                      ? 'text-gray-700'
                      : `font-semibold text-gray-900`
                  }
                `}
              >
                {notification.title}
              </h3>
            </div>

            <p className="mb-2 text-sm text-gray-600">{notification.content}</p>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="text-xs">
                {label}
              </Badge>

              <span className="text-xs text-gray-500">
                {getRelativeTime(notification.createdAt)}
              </span>

              {!notification.isRead && onMarkAsRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAsRead}
                  className="ml-auto h-7 px-2 text-xs"
                >
                  <Check className="mr-1 size-3" />
                  Отметить как прочитанное
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
