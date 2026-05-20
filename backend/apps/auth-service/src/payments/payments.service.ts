import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PaymentRepository } from './repositories/payment.repository';
import { TinkoffClientService } from './tinkoff-client.service';
import { InitPaymentDto } from '@app/contracts';
import { PaymentStatus } from '@app/shared';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly tinkoffClient: TinkoffClientService,
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
}
