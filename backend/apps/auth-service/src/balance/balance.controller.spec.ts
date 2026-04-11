import { Test, TestingModule } from '@nestjs/testing';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { DepositDto } from './dto/deposit.dto';
import { ReserveDto } from './dto/reserve.dto';
import { ReleaseDto } from './dto/release.dto';
import { RefundDto } from './dto/refund.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionListResponseDto } from './dto/transaction-list-response.dto';
import type { AuthenticatedUser } from '@app/shared';

describe('BalanceController', () => {
  let controller: BalanceController;
  let balanceService: any;

  const mockUser: AuthenticatedUser = {
    id: 'user-1',
    email: 'test@example.com',
  };

  const mockTransactionResponse: TransactionResponseDto = {
    id: 'transaction-1',
    type: 'deposit',
    amount: 100,
    bookingId: null,
    description: 'Deposit',
    createdAt: new Date().toISOString(),
  };

  const mockTransactionListResponse: TransactionListResponseDto = {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  };

  const mockBalanceService = {
    deposit: jest.fn(),
    reserve: jest.fn(),
    release: jest.fn(),
    refund: jest.fn(),
    getTransactions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalanceController],
      providers: [{ provide: BalanceService, useValue: mockBalanceService }],
    }).compile();

    controller = module.get<BalanceController>(BalanceController);
    balanceService = module.get(BalanceService);
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

    it('should call balanceService.deposit with valid DepositDto', async () => {
      mockBalanceService.deposit.mockResolvedValue(mockTransactionResponse);

      const result = await controller.deposit(depositDto);

      expect(result).toEqual(mockTransactionResponse);
      expect(balanceService.deposit).toHaveBeenCalledWith(depositDto);
    });
  });

  describe('reserve', () => {
    const reserveDto: ReserveDto = {
      userId: 'user-1',
      amount: 50,
      bookingId: 'booking-1',
    };

    it('should call balanceService.reserve with valid ReserveDto', async () => {
      mockBalanceService.reserve.mockResolvedValue({
        ...mockTransactionResponse,
        type: 'reserve',
        bookingId: 'booking-1',
        description: 'Reserve for booking booking-1',
      });

      const result = await controller.reserve(reserveDto);

      expect(result.type).toBe('reserve');
      expect(result.bookingId).toBe('booking-1');
      expect(balanceService.reserve).toHaveBeenCalledWith(reserveDto);
    });
  });

  describe('release', () => {
    const releaseDto: ReleaseDto = {
      userId: 'user-1',
      amount: 50,
      bookingId: 'booking-1',
    };

    it('should call balanceService.release with valid ReleaseDto', async () => {
      mockBalanceService.release.mockResolvedValue({
        ...mockTransactionResponse,
        type: 'release',
        bookingId: 'booking-1',
        description: 'Release reserve for booking booking-1',
      });

      const result = await controller.release(releaseDto);

      expect(result.type).toBe('release');
      expect(result.bookingId).toBe('booking-1');
      expect(balanceService.release).toHaveBeenCalledWith(releaseDto);
    });
  });

  describe('refund', () => {
    const refundDto: RefundDto = {
      userId: 'user-1',
      amount: 50,
      bookingId: 'booking-1',
    };

    it('should call balanceService.refund with valid RefundDto', async () => {
      mockBalanceService.refund.mockResolvedValue({
        ...mockTransactionResponse,
        type: 'refund',
        bookingId: 'booking-1',
        description: 'Refund for booking booking-1',
      });

      const result = await controller.refund(refundDto);

      expect(result.type).toBe('refund');
      expect(result.bookingId).toBe('booking-1');
      expect(balanceService.refund).toHaveBeenCalledWith(refundDto);
    });
  });

  describe('getTransactions', () => {
    it('should call balanceService.getTransactions with user.id', async () => {
      mockBalanceService.getTransactions.mockResolvedValue(
        mockTransactionListResponse,
      );

      const result = await controller.getTransactions(mockUser, undefined);

      expect(result).toEqual(mockTransactionListResponse);
      expect(balanceService.getTransactions).toHaveBeenCalledWith(
        'user-1',
        undefined,
      );
    });
  });
});
