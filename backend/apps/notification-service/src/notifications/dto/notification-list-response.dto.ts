import { NotificationResponseDto } from './notification-response.dto';

export class NotificationListResponseDto {
  items: NotificationResponseDto[];
  total: number;
  page: number;
  limit: number;
}
