import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { PaymentStatus } from '@app/shared';
import { PaginationParams, normalizePaginationParams } from '@app/shared';

export interface CreatePaymentParams {
  userId: string;
  amount: number;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface FindByUserIdOptions extends PaginationParams {
  status?: PaymentStatus;
}

@Injectable()
export class PaymentRepository extends Repository<Payment> {
  constructor(dataSource: DataSource) {
    super(Payment, dataSource.createEntityManager());
  }

  async createPayment(params: CreatePaymentParams): Promise<Payment> {
    const payment = this.create({
      userId: params.userId,
      amount: params.amount,
      description: params.description ?? null,
      metadata: params.metadata ?? null,
      status: PaymentStatus.PENDING,
    });

    return this.save(payment);
  }

  async findByUserId(
    userId: string,
    options?: FindByUserIdOptions,
  ): Promise<{
    items: Payment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, skip } = normalizePaginationParams(options || {});

    const queryBuilder = this.createQueryBuilder('payment')
      .where('payment.userId = :userId', { userId })
      .orderBy('payment.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (options?.status) {
      queryBuilder.andWhere('payment.status = :status', {
        status: options.status,
      });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findById(paymentId: string): Promise<Payment | undefined> {
    const payment = await this.findOne({
      where: { id: paymentId },
    });
    return payment ?? undefined;
  }

  async findByTinkoffPaymentId(
    tinkoffPaymentId: string,
  ): Promise<Payment | undefined> {
    const payment = await this.findOne({
      where: { tinkoffPaymentId },
    });
    return payment ?? undefined;
  }

  async updateStatus(
    paymentId: string,
    status: PaymentStatus,
    tinkoffPaymentId?: string,
    tinkoffStatus?: string,
  ): Promise<Payment> {
    await this.update(paymentId, {
      status,
      ...(tinkoffPaymentId !== undefined && { tinkoffPaymentId }),
      ...(tinkoffStatus !== undefined && { tinkoffStatus }),
    });

    const payment = await this.findById(paymentId);
    if (!payment) {
      throw new Error(`Payment with id ${paymentId} not found after update`);
    }

    return payment;
  }

  async updateTinkoffStatus(
    paymentId: string,
    tinkoffStatus: string,
  ): Promise<Payment> {
    await this.update(paymentId, { tinkoffStatus });

    const payment = await this.findById(paymentId);
    if (!payment) {
      throw new Error(`Payment with id ${paymentId} not found after update`);
    }

    return payment;
  }
}
