import { IsInt, IsUUID, Min } from 'class-validator';

export class ReserveDto {
  @IsUUID()
  userId: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsUUID()
  bookingId: string;
}
