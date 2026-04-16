import { TransactionType } from '@app/shared/enums';

export class TransactionResponseDto {
  id!: string;
  type!: TransactionType;
  amount!: number;
  bookingId!: string | null;
  description!: string | null;
  createdAt!: string;
}
