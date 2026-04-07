import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(['info', 'warning', 'success', 'error'])
  type: 'info' | 'warning' | 'success' | 'error';

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class NotificationDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  readAt?: Date;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

export class MarkAsReadDto {
  @IsUUID()
  notificationId: string;
}

export class MarkAllAsReadDto {
  @IsUUID()
  userId: string;
}
