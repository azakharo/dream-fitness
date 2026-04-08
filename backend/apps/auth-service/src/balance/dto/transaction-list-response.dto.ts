import { TransactionResponseDto } from './transaction-response.dto';

export class TransactionListResponseDto {
  items: TransactionResponseDto[];
  total: number;
  page: number;
  limit: number;
}
