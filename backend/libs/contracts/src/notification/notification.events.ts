export interface NotificationCreatedEvent {
  eventType: 'notification.created';
  data: {
    notificationId: string;
    userId: string;
    title: string;
    message: string;
    type: string;
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
