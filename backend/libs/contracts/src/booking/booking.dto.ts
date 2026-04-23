import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '@app/shared/enums';

export class CreateBookingDto {
  @IsUUID()
  trainingId: string;
}

export class BookingDto {
  id: string;
  trainingId: string;
  userId: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  bookedAt: Date;
  cancelledAt?: Date;
  updatedAt: Date;
}

export class WaitlistDto {
  id: string;
  trainingId: string;
  userId: string;
  position: number;
  joinedAt: Date;
}

export class CancelBookingDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class JoinWaitlistDto {
  @IsUUID()
  trainingId: string;
}

export class BookingFilterDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsUUID()
  trainingId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class WaitlistFilterDto {
  @IsOptional()
  @IsUUID()
  trainingId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
