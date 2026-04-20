import { NotificationType } from '@app/shared/enums';

export interface NotificationCreatedEvent {
  eventType: 'notification.created';
  data: {
    notificationId: string;
    userId: string;
    title: string;
    content: string;
    type: NotificationType;
    metadata?: Record<string, unknown>;
  };
}

export interface NotificationReadEvent {
  eventType: 'notification.read';
  data: {
    notificationId: string;
    userId: string;
    readAt: string;
  };
}
