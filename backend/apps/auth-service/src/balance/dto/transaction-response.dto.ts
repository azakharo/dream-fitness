import { TransactionType } from '../entities/transaction.entity';

export class TransactionResponseDto {
  id!: string;
  type!: TransactionType;
  amount!: number;
  bookingId!: string | null;
  description!: string | null;
  createdAt!: string;
}
