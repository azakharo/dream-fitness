import { NotificationType } from '@app/shared';

export class NotificationResponseDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}
