import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TransactionRepository } from './repositories/transaction.repository';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { DepositDto } from './dto/deposit.dto';
import { ReserveDto } from './dto/reserve.dto';
import { ReleaseDto } from './dto/release.dto';
import { RefundDto } from './dto/refund.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionListResponseDto } from './dto/transaction-list-response.dto';
import { PaginationParams } from '@app/shared';
import { UserRepository } from '../users/repositories/user.repository';
import { InsufficientBalanceException } from '../common/exceptions/insufficient-balance.exception';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(TransactionRepository)
    private readonly transactionRepository: TransactionRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

  async deposit(depositDto: DepositDto): Promise<TransactionResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const transaction = await manager.save(Transaction, {
        userId: depositDto.userId,
        type: TransactionType.DEPOSIT,
        amount: depositDto.amount,
        description: depositDto.description,
      });

      await this.userRepository.updateBalance(
        depositDto.userId,
        depositDto.amount,
      );

      return this.mapToResponseDto(transaction);
    });
  }

  async reserve(reserveDto: ReserveDto): Promise<TransactionResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const balance = await this.transactionRepository.getBalance(
        reserveDto.userId,
      );
      if (balance < reserveDto.amount) {
        throw new InsufficientBalanceException(balance, reserveDto.amount);
      }

      const transaction = await manager.save(Transaction, {
        userId: reserveDto.userId,
        type: TransactionType.RESERVE,
        amount: reserveDto.amount,
        bookingId: reserveDto.bookingId,
        description: `Reserve for booking ${reserveDto.bookingId}`,
      });

      await this.userRepository.updateBalance(
        reserveDto.userId,
        -reserveDto.amount,
      );

      return this.mapToResponseDto(transaction);
    });
  }

  async release(releaseDto: ReleaseDto): Promise<TransactionResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      // Find the reserve transaction for this booking
      const reserveTransaction =
        await this.transactionRepository.findReserveByBookingId(
          releaseDto.userId,
          releaseDto.bookingId,
        );

      if (!reserveTransaction) {
        throw new NotFoundException(
          `Reserve transaction not found for booking ${releaseDto.bookingId}`,
        );
      }

      const transaction = await manager.save(Transaction, {
        userId: releaseDto.userId,
        type: TransactionType.RELEASE,
        amount: releaseDto.amount,
        bookingId: releaseDto.bookingId,
        description: `Release reserve for booking ${releaseDto.bookingId}`,
      });

      // Note: DO NOT increase user balance (money left the system)
      return this.mapToResponseDto(transaction);
    });
  }

  async refund(refundDto: RefundDto): Promise<TransactionResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const transaction = await manager.save(Transaction, {
        userId: refundDto.userId,
        type: TransactionType.REFUND,
        amount: refundDto.amount,
        bookingId: refundDto.bookingId,
        description: `Refund for booking ${refundDto.bookingId}`,
      });

      await this.userRepository.updateBalance(
        refundDto.userId,
        refundDto.amount,
      );

      return this.mapToResponseDto(transaction);
    });
  }

  async getTransactions(
    userId: string,
    filters?: PaginationParams,
  ): Promise<TransactionListResponseDto> {
    const { items, total, page, limit } =
      await this.transactionRepository.findByUserId(userId, filters);

    return {
      items: items.map((item) => this.mapToResponseDto(item)),
      total,
      page,
      limit,
    };
  }

  async checkEnoughBalance(userId: string, amount: number): Promise<boolean> {
    const balance = await this.transactionRepository.getBalance(userId);
    return balance >= amount;
  }

  private mapToResponseDto(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      bookingId: transaction.bookingId,
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
    };
  }
}
