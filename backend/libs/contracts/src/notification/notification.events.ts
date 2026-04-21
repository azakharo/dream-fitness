import { NotificationType } from '@app/shared/enums';
import { ROUTING_KEYS } from '@app/shared/rabbitmq/rabbitmq.constants';

export interface NotificationCreatedEvent {
  eventType: (typeof ROUTING_KEYS)['NOTIFICATION_CREATED'];
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
