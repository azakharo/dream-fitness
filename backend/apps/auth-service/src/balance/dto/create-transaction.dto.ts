import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsUUID()
  userId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsUUID()
  bookingId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;
}
