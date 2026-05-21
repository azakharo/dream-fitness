import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import * as crypto from 'crypto';

export interface TinkoffInitRequest {
  Amount: number;
  OrderId: string;
  Description?: string;
  DATA?: Record<string, string>;
  Receipt?: TinkoffReceipt;
}

export interface TinkoffReceipt {
  Email?: string;
  Phone?: string;
  EmailCompany?: string;
  Taxation: string;
  Items: TinkoffReceiptItem[];
}

export interface TinkoffReceiptItem {
  Name: string;
  Price: number;
  Quantity: number;
  Amount: number;
  Tax: string;
}

export interface TinkoffInitResponse {
  Success: boolean;
  ErrorCode: string;
  Message?: string;
  Details?: string;
  PaymentId: string;
  PaymentURL: string;
}

export interface TinkoffGetStateResponse {
  Success: boolean;
  ErrorCode: string;
  Message?: string;
  Status: string;
  PaymentId: string;
  OrderId: string;
}

@Injectable()
export class TinkoffClientService {
  private readonly logger = new Logger(TinkoffClientService.name);
  private readonly terminalKey: string;
  private readonly secretKey: string;
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.terminalKey = this.configService.get<string>(
      'TINKOFF_TERMINAL_KEY',
      '',
    );
    this.secretKey = this.configService.get<string>('TINKOFF_SECRET_KEY', '');
    this.apiUrl = this.configService.get<string>(
      'TINKOFF_API_URL',
      'https://securepay.tinkoff.ru/v2',
    );
  }

  async initPayment(
    amountKopeks: number,
    orderId: string,
    description?: string,
    receipt?: TinkoffReceipt,
  ): Promise<TinkoffInitResponse> {
    const payload: TinkoffInitRequest = {
      Amount: amountKopeks,
      OrderId: orderId,
      Description: description,
    };

    if (receipt) {
      payload.Receipt = receipt;
    }

    const request = this.buildRequest(payload);

    try {
      const response = await firstValueFrom(
        this.httpService.post<TinkoffInitResponse>(
          `${this.apiUrl}/Init`,
          request,
          { timeout: 10000 },
        ),
      );

      this.logger.log(
        `Init payment for order ${orderId}: PaymentId=${response.data.PaymentId}, Success=${response.data.Success}`,
      );

      return response.data;
    } catch (error) {
      this.handleRequestError(error, 'initPayment', orderId);
      throw error;
    }
  }

  async getPaymentState(paymentId: string): Promise<TinkoffGetStateResponse> {
    const payload = {
      PaymentId: paymentId,
    };

    const request = this.buildRequest(payload);

    try {
      const response = await firstValueFrom(
        this.httpService.post<TinkoffGetStateResponse>(
          `${this.apiUrl}/GetState`,
          request,
          { timeout: 10000 },
        ),
      );

      this.logger.log(
        `Get payment state for PaymentId=${paymentId}: Status=${response.data.Status}`,
      );

      return response.data;
    } catch (error) {
      this.handleRequestError(error, 'getPaymentState', paymentId);
      throw error;
    }
  }

  verifyToken(payload: Record<string, unknown>): boolean {
    const token = payload.Token;
    if (!token || typeof token !== 'string') {
      return false;
    }

    const payloadWithoutToken = { ...payload };
    delete payloadWithoutToken.Token;

    const expectedToken = this.generateToken(payloadWithoutToken);

    return token === expectedToken;
  }

  private buildRequest<T extends object>(
    payload: T,
  ): T & { TerminalKey: string; Token: string } {
    const requestPayload = {
      ...payload,
      TerminalKey: this.terminalKey,
    };

    const token = this.generateToken(requestPayload as Record<string, unknown>);

    return {
      ...requestPayload,
      Token: token,
    };
  }

  private generateToken(payload: Record<string, unknown>): string {
    const sortedKeys = Object.keys(payload)
      .filter((key) => payload[key] !== undefined && payload[key] !== null)
      .sort();

    const concatenated = sortedKeys.map((key) => String(payload[key])).join('');

    const stringToHash = this.secretKey + concatenated;

    return crypto.createHash('sha256').update(stringToHash).digest('hex');
  }

  private handleRequestError(
    error: unknown,
    operation: string,
    context: string,
  ): void {
    if (error instanceof AxiosError) {
      this.logger.error(
        `Tinkoff API error during ${operation} for ${context}: ${error.message}`,
        error.response?.data,
      );
    } else {
      this.logger.error(
        `Unexpected error during ${operation} for ${context}`,
        error,
      );
    }
  }
}
