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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@app/shared/enums';

export class CreateBookingDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  trainingId: string;
}

export class BookingDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  trainingId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ['confirmed', 'cancelled', 'completed'] })
  status: 'confirmed' | 'cancelled' | 'completed';

  @ApiProperty()
  bookedAt: Date;

  @ApiPropertyOptional()
  cancelledAt?: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class WaitlistDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  trainingId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  position: number;

  @ApiProperty()
  joinedAt: Date;
}

export class CancelBookingDto {
  @ApiPropertyOptional({ example: 'Unable to attend' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class JoinWaitlistDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  trainingId: string;
}

export class BookingFilterDto {
  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  trainingId?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class WaitlistFilterDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  trainingId?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
