import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BalanceService } from './balance.service';
import { Transaction } from './entities/transaction.entity';
import { TransactionRepository } from './repositories/transaction.repository';
import { UserRepository } from '../users/repositories/user.repository';
import { DepositDto } from './dto/deposit.dto';
import { ReserveDto } from './dto/reserve.dto';
import { ReleaseDto } from './dto/release.dto';
import { RefundDto } from './dto/refund.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionListResponseDto } from './dto/transaction-list-response.dto';
import { InsufficientBalanceException } from '../common/exceptions/insufficient-balance.exception';
import { NotFoundException } from '@nestjs/common';

describe('BalanceService', () => {
  let service: BalanceService;
  let transactionRepository: any;
  let userRepository: any;
  let dataSource: any;
  let eventsPublisher: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    balance: 100,
    role: 'client',
    status: 'active',
  };

  const mockTransaction: Transaction = {
    id: 'transaction-1',
    userId: 'user-1',
    type: 'deposit',
    amount: 100,
    bookingId: null,
    description: 'Deposit',
    createdAt: new Date(),
  };

  const mockTransactionResponse: TransactionResponseDto = {
    id: 'transaction-1',
    type: 'deposit',
    amount: 100,
    bookingId: null,
    description: 'Deposit',
    createdAt: new Date().toISOString(),
  };

  const mockTransactionRepository = {
    findByUserId: jest.fn(),
    findReserveByBookingId: jest.fn(),
  };

  const mockUserRepository = {
    findByIdWithBalance: jest.fn(),
    findByIdWithBalanceForUpdate: jest.fn(),
    updateBalance: jest.fn(),
  };

  const mockEventsPublisher = {
    publishBalanceChanged: jest.fn().mockResolvedValue(undefined),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockUserRepository,
        },
        { provide: DataSource, useValue: mockDataSource },
        { provide: EventsPublisher, useValue: mockEventsPublisher },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
    transactionRepository = module.get(getRepositoryToken(Transaction));
    userRepository = module.get(getRepositoryToken(UserRepository));
    dataSource = module.get(DataSource);
    eventsPublisher = module.get(EventsPublisher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deposit', () => {
    const depositDto: DepositDto = {
      userId: 'user-1',
      amount: 100,
      description: 'Test deposit',
    };

    it('should successfully deposit and return TransactionResponseDto', async () => {
      const manager = {};
      mockDataSource.transaction.mockImplementation(async (callback) =>
        callback(manager),
      );
      mockUserRepository.findByIdWithBalanceForUpdate.mockResolvedValue(
        mockUser,
      );
      mockTransactionRepository.findByUserId.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
      });
      mockTransactionRepository.createTransaction.mockResolvedValue(
        mockTransaction,
      );
      mockUserRepository.updateBalance.mockResolvedValue(undefined);
      mockEventsPublisher.publishBalanceChanged.mockResolvedValue(undefined);

      const result = await service.deposit(depositDto);

      expect(result).toEqual(mockTransactionResponse);
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(
        mockUserRepository.findByIdWithBalanceForUpdate,
      ).toHaveBeenCalledWith('user-1', manager);
      expect(mockEventsPublisher.publishBalanceChanged).toHaveBeenCalledWith({
        userId: 'user-1',
        oldBalance: 100,
        newBalance: 200,
        amount: 100,
        description: 'Test deposit',
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      const manager = {};
      mockDataSource.transaction.mockImplementation(async (callback) =>
        callback(manager),
      );
      mockUserRepository.findByIdWithBalanceForUpdate.mockResolvedValue(
        undefined,
      );

      await expect(service.deposit(depositDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deposit(depositDto)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('reserve', () => {
    const reserveDto: ReserveDto = {
      userId: 'user-1',
      amount: 50,
      bookingId: 'booking-1',
    };

    it('should successfully reserve and return transaction type=reserve', async () => {
      const manager = {};
      mockDataSource.transaction.mockImplementation(async (callback) =>
        callback(manager),
      );
      mockUserRepository.findByIdWithBalanceForUpdate.mockResolvedValue(
        mockUser,
      );
      mockTransactionRepository.findByUserId.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
      });
      mockTransactionRepository.createTransaction.mockResolvedValue({
        ...mockTransaction,
        type: 'reserve',
        bookingId: 'booking-1',
        description: 'Reserve for booking booking-1',
      });
      mockUserRepository.updateBalance.mockResolvedValue(undefined);
      mockEventsPublisher.publishBalanceChanged.mockResolvedValue(undefined);

      const result = await service.reserve(reserveDto);

      expect(result.type).toBe('reserve');
      expect(result.bookingId).toBe('booking-1');
      expect(mockUserRepository.updateBalance).toHaveBeenCalledWith(
        'user-1',
        -50,
        manager,
      );
    });

    it('should throw InsufficientBalanceException when insufficient balance', async () => {
      const manager = {};
      mockDataSource.transaction.mockImplementation(async (callback) =>
        callback(manager),
      );
      mockUserRepository.findByIdWithBalanceForUpdate.mockResolvedValue({
        ...mockUser,
        balance: 20,
      });

      await expect(service.reserve(reserveDto)).rejects.toThrow(
        InsufficientBalanceException,
      );
      await expect(service.reserve(reserveDto)).rejects.toThrow(
        'Insufficient balance',
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      const manager = {};
      mockDataSource.transaction.mockImplementation(async (callback) =>
        callback(manager),
      );
      mockUserRepository.findByIdWithBalanceForUpdate.mockResolvedValue(
        undefined,
      );

      await expect(service.reserve(reserveDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.reserve(reserveDto)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('release', () => {
    const releaseDto: ReleaseDto = {
      userId: 'user-1',
      amount: 50,
      bookingId: 'booking-1',
    };

    it('should successfully release and return transaction type=release', async () => {
      const manager = {};
      mockDataSource.transaction.mockImplementation(async (callback) =>
        callback(manager),
      );
      mockUserRepository.findByIdWithBalanceForUpdate.mockResolvedValue(
        mockUser,
      );
      mockTransactionRepository.findReserveByBookingId.mockResolvedValue({
        ...mockTransaction,
        type: 'reserve',
        bookingId: 'booking-1',
      });
      mockTransactionRepository.createTransaction.mockResolvedValue({
        ...mockTransaction,
        type: 'release',
        bookingId: 'booking-1',
        description: 'Release reserve for booking booking-1',
      });
      mockUserRepository.updateBalance.mockResolvedValue(undefined);
      mockEventsPublisher.publishBalanceChanged.mockResolvedValue(undefined);

      const result = await service.release(releaseDto);

      expect(result.type).toBe('release');
      expect(result.bookingId).toBe('booking-1');
      expect(mockUserRepository.updateBalance).toHaveBeenCalledWith(
        'user-1',
        50,
        manager,
      );
    });

    it('should throw NotFoundException when reserve not found', async () => {
      const manager = {};
      mockDataSource.transaction.mockImplementation(async (callback) =>
        callback(manager),
      );
      mockUserRepository.findByIdWithBalanceForUpdate.mockResolvedValue(
        mockUser,
      );
      mockTransactionRepository.findReserveByBookingId.mockResolvedValue(
        undefined,
      );

      await expect(service.release(releaseDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.release(releaseDto)).rejects.toThrow(
        'Reserve transaction not found for booking booking-1',
      );
    });
  });

  describe('refund', () => {
    const refundDto: RefundDto = {
      userId: 'user-1',
      amount: 50,
      bookingId: 'booking-1',
    };

    it('should successfully refund and return transaction type=refund', async () => {
      const manager = {};
      mockDataSource.transaction.mockImplementation(async (callback) =>
        callback(manager),
      );
      mockUserRepository.findByIdWithBalanceForUpdate.mockResolvedValue(
        mockUser,
      );
      mockTransactionRepository.findByUserId.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
      });
      mockTransactionRepository.createTransaction.mockResolvedValue({
        ...mockTransaction,
        type: 'refund',
        bookingId: 'booking-1',
        description: 'Refund for booking booking-1',
      });
      mockUserRepository.updateBalance.mockResolvedValue(undefined);
      mockEventsPublisher.publishBalanceChanged.mockResolvedValue(undefined);

      const result = await service.refund(refundDto);

      expect(result.type).toBe('refund');
      expect(result.bookingId).toBe('booking-1');
      expect(mockUserRepository.updateBalance).toHaveBeenCalledWith(
        'user-1',
        50,
        manager,
      );
    });
  });

  describe('getTransactions', () => {
    const mockTransactions = [
      {
        ...mockTransaction,
        id: 'transaction-1',
        type: 'deposit',
        amount: 100,
        bookingId: null,
        description: 'Deposit',
        createdAt: new Date(),
      },
      {
        ...mockTransaction,
        id: 'transaction-2',
        type: 'reserve',
        amount: 50,
        bookingId: 'booking-1',
        description: 'Reserve for booking booking-1',
        createdAt: new Date(),
      },
    ];

    it('should return TransactionListResponseDto with existing transactions', async () => {
      mockTransactionRepository.findByUserId.mockResolvedValue({
        items: mockTransactions,
        total: 2,
        page: 1,
        limit: 10,
      });

      const result = await service.getTransactions('user-1');

      expect(result).toEqual({
        items: mockTransactions.map((t) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          bookingId: t.bookingId,
          description: t.description,
          createdAt: t.createdAt.toISOString(),
        })),
        total: 2,
        page: 1,
        limit: 10,
      });
      expect(mockTransactionRepository.findByUserId).toHaveBeenCalledWith(
        'user-1',
        undefined,
      );
    });
  });

  describe('checkEnoughBalance', () => {
    it('should return true when sufficient balance', async () => {
      mockUserRepository.findByIdWithBalance.mockResolvedValue({
        ...mockUser,
        balance: 100,
      });

      const result = await service.checkEnoughBalance('user-1', 50);

      expect(result).toBe(true);
      expect(mockUserRepository.findByIdWithBalance).toHaveBeenCalledWith(
        'user-1',
      );
    });

    it('should return false when insufficient balance', async () => {
      mockUserRepository.findByIdWithBalance.mockResolvedValue({
        ...mockUser,
        balance: 20,
      });

      const result = await service.checkEnoughBalance('user-1', 50);

      expect(result).toBe(false);
    });
  });
});
