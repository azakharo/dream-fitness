import * as request from 'supertest';
import { TestResponse } from './auth.helper';
import { DepositDto } from '../../src/balance/dto/deposit.dto';
import { ReserveDto } from '../../src/balance/dto/reserve.dto';
import { ReleaseDto } from '../../src/balance/dto/release.dto';
import { RefundDto } from '../../src/balance/dto/refund.dto';

interface TransactionResponseBody {
  id: string;
  type: string;
  amount: number;
  userId: string;
  bookingId?: string;
  createdAt: string;
  message?: string;
}

interface BalanceResponseBody {
  balance: number;
}

interface TransactionListResponseBody {
  items: TransactionResponseBody[];
  total: number;
  page?: number;
  limit?: number;
}

export class BalanceHelper {
  constructor(private readonly request: request.SuperTest<request.Test>) {}

  deposit(
    accessToken: string,
    dto: DepositDto,
  ): Promise<TestResponse<TransactionResponseBody>> {
    return this.request
      .post('/auth/balance/deposit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto);
  }

  reserve(
    accessToken: string,
    dto: ReserveDto,
  ): Promise<TestResponse<TransactionResponseBody>> {
    return this.request
      .post('/auth/balance/reserve')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto);
  }

  release(
    accessToken: string,
    dto: ReleaseDto,
  ): Promise<TestResponse<TransactionResponseBody>> {
    return this.request
      .post('/auth/balance/release')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto);
  }

  refund(
    accessToken: string,
    dto: RefundDto,
  ): Promise<TestResponse<TransactionResponseBody>> {
    return this.request
      .post('/auth/balance/refund')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto);
  }

  getBalance(accessToken: string): Promise<TestResponse<BalanceResponseBody>> {
    return this.request
      .get('/auth/balance')
      .set('Authorization', `Bearer ${accessToken}`);
  }

  getTransactions(
    accessToken: string,
    query?: { page?: number; limit?: number },
  ): Promise<TestResponse<TransactionListResponseBody>> {
    let req = this.request
      .get('/auth/transactions')
      .set('Authorization', `Bearer ${accessToken}`);

    if (query) {
      const params = new URLSearchParams();
      if (query.page !== undefined) params.set('page', String(query.page));
      if (query.limit !== undefined) params.set('limit', String(query.limit));
      if (params.toString()) {
        req = req.query(params.toString());
      }
    }

    return req;
  }
}
