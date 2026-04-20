import {
  IsUUID,
  IsEnum,
  IsString,
  IsOptional,
  IsObject,
} from 'class-validator';
import { NotificationType } from '@app/shared';

export class CreateNotificationAdminDto {
  @IsUUID()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
