import { EntityRepository, Repository } from 'typeorm';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { PaginationParams, normalizePaginationParams } from '@app/shared';
import { CreateTransactionDto } from '../dto/create-transaction.dto';

@EntityRepository(Transaction)
export class TransactionRepository extends Repository<Transaction> {
  async findByUserId(
    userId: string,
    options?: PaginationParams,
  ): Promise<{
    items: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, skip } = normalizePaginationParams(options || {});

    const [items, total] = await this.createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .orderBy('transaction.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.create({
      userId: dto.userId,
      type: dto.type,
      amount: dto.amount,
      bookingId: dto.bookingId,
      description: dto.description,
    });

    return this.save(transaction);
  }

  async findReserveByBookingId(
    userId: string,
    bookingId: string,
  ): Promise<Transaction | undefined> {
    const transaction = await this.findOne({
      where: {
        userId,
        bookingId,
        type: TransactionType.RESERVE,
      },
      order: { createdAt: 'DESC' },
    });
    return transaction || undefined;
  }

  async getBalance(userId: string): Promise<number> {
    const result = await this.createQueryBuilder('transaction')
      .select(
        `SUM(CASE
          WHEN transaction.type IN ('deposit', 'refund') THEN transaction.amount
          WHEN transaction.type IN ('withdraw', 'reserve') THEN -transaction.amount
          ELSE 0
        END)`,
        'balance',
      )
      .where('transaction.userId = :userId', { userId })
      .getRawOne();

    return parseInt(result?.balance || 0, 10);
  }
}
