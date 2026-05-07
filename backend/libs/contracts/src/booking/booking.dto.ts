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

export class BookingResponseDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id: string;

  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  userId: string;

  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  trainingId: string;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  updatedAt: string;
}

export class BookingListResponseDto {
  @ApiProperty({ type: [BookingResponseDto] })
  items: BookingResponseDto[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}

// Re-export WaitlistResponseDto from waitlist.dto.ts for backward compatibility
export { WaitlistResponseDto } from './waitlist.dto';
