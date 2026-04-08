import { IsInt, IsUUID, Min } from 'class-validator';

export class ReleaseDto {
  @IsUUID()
  userId: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsUUID()
  bookingId: string;
}
