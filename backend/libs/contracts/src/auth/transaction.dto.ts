import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '@app/shared/enums';

export class TransactionResponseDto {
  id!: string;
  type!: TransactionType;
  amount!: number;
  bookingId!: string | null;
  description!: string | null;
  createdAt!: string;
}

export class TransactionFilterDto {
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
