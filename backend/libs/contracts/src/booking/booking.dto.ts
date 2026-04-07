import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  trainingId: string;

  @IsUUID()
  userId: string;
}

export class BookingDto {
  id: string;
  trainingId: string;
  userId: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  bookedAt: Date;
  cancelledAt?: Date;
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

  @IsUUID()
  userId: string;
}
