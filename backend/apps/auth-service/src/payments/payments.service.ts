import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { PaymentRepository } from './repositories/payment.repository';
import type { ITinkoffClient } from './interfaces/tinkoff-client.interface';
import { BalanceService } from '../balance/balance.service';
import {
  InitPaymentDto,
  TinkoffWebhookDto,
  TinkoffWebhookResponseDto,
} from '@app/contracts';
import { PaymentStatus } from '@app/shared';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    @Inject('TINKOFF_CLIENT')
    private readonly tinkoffClient: ITinkoffClient,
    private readonly balanceService: BalanceService,
  ) {}

  async initPayment(
    userId: string,
    dto: InitPaymentDto,
  ): Promise<{ paymentId: string; paymentUrl: string }> {
    const payment = await this.paymentRepository.createPayment({
      userId,
      amount: dto.amount,
      description: `Пополнение баланса: ${dto.amount} баллов`,
    });

    this.logger.log(
      `Created payment ${payment.id} for user ${userId}, amount: ${dto.amount}`,
    );

    const amountKopeks = dto.amount * 100;
    const tinkoffResponse = await this.tinkoffClient.initPayment(
      amountKopeks,
      payment.id,
      `Пополнение баланса DreamFitness: ${dto.amount} баллов`,
    );

    if (!tinkoffResponse.Success) {
      this.logger.error(
        `Tinkoff init failed for payment ${payment.id}: ${tinkoffResponse.Message}`,
      );
      await this.paymentRepository.updateStatus(
        payment.id,
        PaymentStatus.REJECTED,
        tinkoffResponse.PaymentId,
        'ERROR',
      );
      throw new Error(
        `Payment initialization failed: ${tinkoffResponse.Message || tinkoffResponse.Details}`,
      );
    }

    await this.paymentRepository.updateStatus(
      payment.id,
      PaymentStatus.PENDING,
      tinkoffResponse.PaymentId,
    );

    this.logger.log(
      `Payment ${payment.id} initialized with Tinkoff PaymentId ${tinkoffResponse.PaymentId}`,
    );

    return {
      paymentId: payment.id,
      paymentUrl: tinkoffResponse.PaymentURL,
    };
  }

  async getPaymentStatus(
    userId: string,
    paymentId: string,
  ): Promise<{
    id: string;
    amount: number;
    status: PaymentStatus;
    createdAt: string;
  }> {
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    if (payment.userId !== userId) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    return {
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt.toISOString(),
    };
  }

  async getPaymentHistory(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<{
    payments: Array<{
      id: string;
      amount: number;
      status: PaymentStatus;
      createdAt: string;
    }>;
    total: number;
  }> {
    const result = await this.paymentRepository.findByUserId(userId, {
      page: page ?? 1,
      limit: limit ?? 10,
    });

    return {
      payments: result.items.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt.toISOString(),
      })),
      total: result.total,
    };
  }

  async handleWebhook(
    dto: TinkoffWebhookDto,
  ): Promise<TinkoffWebhookResponseDto> {
    this.logger.log(
      `Webhook received: PaymentId=${dto.PaymentId}, Status=${dto.Status}, OrderId=${dto.OrderId}`,
    );

    const isTokenValid = this.tinkoffClient.verifyToken({
      TerminalKey: dto.TerminalKey,
      PaymentId: dto.PaymentId,
      Status: dto.Status,
      Amount: dto.Amount,
      OrderId: dto.OrderId,
      Success: dto.Success,
      ErrorCode: dto.ErrorCode,
      Message: dto.Message,
      Details: dto.Details,
      Token: dto.Token,
    });

    if (!isTokenValid) {
      this.logger.error(
        `Invalid token for webhook PaymentId=${dto.PaymentId}, OrderId=${dto.OrderId}`,
      );
      return { status: 'OK' };
    }

    this.logger.log(`Token verified for OrderId=${dto.OrderId}`);

    const payment = await this.paymentRepository.findById(dto.OrderId);

    if (!payment) {
      this.logger.warn(`Payment not found for OrderId=${dto.OrderId}`);
      return { status: 'OK' };
    }

    if (payment.status === PaymentStatus.CONFIRMED) {
      this.logger.log(
        `Payment ${dto.OrderId} already confirmed, skipping duplicate webhook`,
      );
      return { status: 'OK' };
    }

    await this.paymentRepository.updateStatus(
      payment.id,
      this.mapTinkoffStatusToPaymentStatus(dto.Status),
      dto.PaymentId,
      dto.Status,
    );

    if (dto.Status === 'CONFIRMED') {
      const amountPoints = Math.floor(dto.Amount / 100);

      await this.balanceService.deposit({
        userId: payment.userId,
        amount: amountPoints,
        description: 'Пополнение через Тинькофф Кассу',
      });

      this.logger.log(
        `Balance credited: userId=${payment.userId}, amount=${amountPoints}`,
      );
    }

    this.logger.log(
      `Webhook processed: OrderId=${dto.OrderId}, Status=${dto.Status}`,
    );
    return { status: 'OK' };
  }

  private mapTinkoffStatusToPaymentStatus(
    tinkoffStatus: string,
  ): PaymentStatus {
    switch (tinkoffStatus) {
      case 'AUTHORIZED':
        return PaymentStatus.AUTHORIZED;
      case 'CONFIRMED':
        return PaymentStatus.CONFIRMED;
      case 'REJECTED':
        return PaymentStatus.REJECTED;
      case 'CANCELED':
        return PaymentStatus.CANCELED;
      default:
        return PaymentStatus.PENDING;
    }
  }
}
