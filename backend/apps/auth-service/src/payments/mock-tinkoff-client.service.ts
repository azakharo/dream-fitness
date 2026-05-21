import { Injectable, Logger } from '@nestjs/common';
import { ITinkoffClient } from './interfaces/tinkoff-client.interface';
import {
  TinkoffReceipt,
  TinkoffInitResponse,
  TinkoffGetStateResponse,
} from './tinkoff-client.service';

@Injectable()
export class MockTinkoffClientService implements ITinkoffClient {
  private readonly logger = new Logger(MockTinkoffClientService.name);

  initPayment(
    amountKopeks: number,
    orderId: string,
    description?: string,
    receipt?: TinkoffReceipt,
  ): Promise<TinkoffInitResponse> {
    const mockPaymentId = `mock_${orderId}`;
    const mockPaymentUrl = `/payment/success?paymentId=${mockPaymentId}`;

    this.logger.log(
      `[MOCK] initPayment: orderId=${orderId}, amountKopeks=${amountKopeks}, paymentId=${mockPaymentId}`,
    );

    if (description) {
      this.logger.debug(`[MOCK] description: ${description}`);
    }

    if (receipt) {
      this.logger.debug(
        `[MOCK] receipt provided with ${receipt.Items?.length ?? 0} items`,
      );
    }

    return Promise.resolve({
      Success: true,
      ErrorCode: '0',
      PaymentId: mockPaymentId,
      PaymentURL: mockPaymentUrl,
    });
  }

  getPaymentState(paymentId: string): Promise<TinkoffGetStateResponse> {
    this.logger.log(
      `[MOCK] getPaymentState: paymentId=${paymentId}, status=CONFIRMED`,
    );

    const orderId = paymentId.startsWith('mock_')
      ? paymentId.substring(5)
      : paymentId;

    return Promise.resolve({
      Success: true,
      ErrorCode: '0',
      Status: 'CONFIRMED',
      PaymentId: paymentId,
      OrderId: orderId,
    });
  }

  verifyToken(payload: Record<string, unknown>): boolean {
    this.logger.log(`[MOCK] verifyToken: always returning true`);
    this.logger.debug(
      `[MOCK] payload keys: ${Object.keys(payload).join(', ')}`,
    );
    return true;
  }
}
