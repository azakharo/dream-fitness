import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { EventsPublisher } from '../events/events.publisher';

@Injectable()
export class BalanceService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
    private readonly eventsPublisher: EventsPublisher,
  ) {}

  async deposit(depositDto: DepositDto): Promise<TransactionResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const user = await this.userRepository.findByIdWithBalanceForUpdate(
        depositDto.userId,
        manager,
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const oldBalance = user.balance;

      const transaction = await manager.save(Transaction, {
        userId: depositDto.userId,
        type: TransactionType.DEPOSIT,
        amount: depositDto.amount,
        description: depositDto.description || 'Deposit',
      });

      await this.userRepository.updateBalance(
        depositDto.userId,
        depositDto.amount,
        manager,
      );

      const newBalance = oldBalance + depositDto.amount;

      await this.eventsPublisher.publishBalanceChanged({
        userId: depositDto.userId,
        oldBalance,
        newBalance,
        amount: depositDto.amount,
        description: depositDto.description || 'Deposit',
      });

      return this.mapToResponseDto(transaction);
    });
  }

  async reserve(reserveDto: ReserveDto): Promise<TransactionResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const { userId, bookingId, amount } = reserveDto;

      if (!bookingId) {
        throw new BadRequestException('Booking ID is missing');
      }

      const user = await this.userRepository.findByIdWithBalanceForUpdate(
        userId,
        manager,
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const oldBalance = user.balance;
      if (oldBalance < amount) {
        throw new InsufficientBalanceException(oldBalance, amount);
      }

      const transaction = await manager.save(Transaction, {
        userId,
        type: TransactionType.RESERVE,
        amount,
        bookingId,
        description: `Reserve for booking ${bookingId}`,
      });

      await this.userRepository.updateBalance(userId, -amount, manager);

      const newBalance = oldBalance - amount;

      await this.eventsPublisher.publishBalanceChanged({
        userId,
        oldBalance,
        newBalance,
        amount,
        description: `Reserve for booking ${bookingId}`,
      });

      return this.mapToResponseDto(transaction);
    });
  }

  async release(releaseDto: ReleaseDto): Promise<TransactionResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const user = await this.userRepository.findByIdWithBalanceForUpdate(
        releaseDto.userId,
        manager,
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const oldBalance = user.balance;

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

      await this.userRepository.updateBalance(
        releaseDto.userId,
        releaseDto.amount,
        manager,
      );

      const newBalance = oldBalance + releaseDto.amount;

      await this.eventsPublisher.publishBalanceChanged({
        userId: releaseDto.userId,
        oldBalance,
        newBalance,
        amount: releaseDto.amount,
        description: `Release reserve for booking ${releaseDto.bookingId}`,
      });

      return this.mapToResponseDto(transaction);
    });
  }

  async refund(refundDto: RefundDto): Promise<TransactionResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      if (!refundDto.bookingId) {
        throw new BadRequestException('Booking ID is missing');
      }

      const user = await this.userRepository.findByIdWithBalanceForUpdate(
        refundDto.userId,
        manager,
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const oldBalance = user.balance;

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
        manager,
      );

      const newBalance = oldBalance + refundDto.amount;

      await this.eventsPublisher.publishBalanceChanged({
        userId: refundDto.userId,
        oldBalance,
        newBalance,
        amount: refundDto.amount,
        description: `Refund for booking ${refundDto.bookingId}`,
      });

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
    const user = await this.userRepository.findByIdWithBalance(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.balance >= amount;
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
