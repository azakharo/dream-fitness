import {Link} from '@tanstack/react-router';
import {Bell, Check} from 'lucide-react';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
} from '@/hooks/use-notifications';
import {useUIStore} from '@/stores/ui-store';
import {Button} from '@/components/ui/Button';
import {Badge} from '@/components/ui/Badge';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/Popover';
import {ROUTES} from '@/lib/routes';

export const NotificationsBell: React.FC = () => {
  const {data: unreadData} = useUnreadCount();
  const {data: notificationData} = useNotifications(5);
  const {notificationsOpen, setNotificationsOpen} = useUIStore();
  const notifications = notificationData?.items ?? [];
  const {mutate: markAsRead} = useMarkAsRead();

  const unreadCount = unreadData?.count ?? 0;

  return (
    <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span
              className="
                absolute -top-1 -right-1 flex size-5 items-center justify-center
                rounded-full bg-primary text-xs text-primary-foreground
              "
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-medium">Уведомления</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} новых</Badge>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto">
          {Array.isArray(notifications) &&
            notifications?.map(notification => (
              <div
                key={notification.id}
                className={`
                  rounded-sm border-b px-3 py-2
                  last:border-b-0
                  ${!notification.isRead ? 'bg-blue-50/50' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <span className="size-2 shrink-0 rounded-full bg-blue-500" />
                  )}
                  <p
                    className={`
                      flex-1 text-sm
                      ${!notification.isRead ? 'font-semibold' : 'font-medium'}
                    `}
                  >
                    {notification.title}
                  </p>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => markAsRead(notification.id)}
                      className="size-8 shrink-0 rounded-full"
                    >
                      <Check className="size-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {notification.content}
                </p>
              </div>
            ))}
          {(!notifications || notifications.length === 0) && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Нет уведомлений
            </p>
          )}
        </div>
        <Link
          to={ROUTES.NOTIFICATIONS as never}
          className="
            mt-2 block text-center text-sm text-primary
            hover:underline
          "
          onClick={() => setNotificationsOpen(false)}
        >
          Все уведомления
        </Link>
      </PopoverContent>
    </Popover>
  );
};
