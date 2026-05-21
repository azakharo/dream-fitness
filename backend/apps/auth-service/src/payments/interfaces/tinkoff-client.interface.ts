import {
  TinkoffReceipt,
  TinkoffInitResponse,
  TinkoffGetStateResponse,
} from '../tinkoff-client.service';

export interface ITinkoffClient {
  initPayment(
    amountKopeks: number,
    orderId: string,
    description?: string,
    receipt?: TinkoffReceipt,
  ): Promise<TinkoffInitResponse>;

  getPaymentState(paymentId: string): Promise<TinkoffGetStateResponse>;

  verifyToken(payload: Record<string, unknown>): boolean;
}
