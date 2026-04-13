import * as request from 'supertest';
import { TestResponse } from './auth.helper';
import { DepositDto } from '../../src/balance/dto/deposit.dto';
import { ReserveDto } from '../../src/balance/dto/reserve.dto';
import { ReleaseDto } from '../../src/balance/dto/release.dto';
import { RefundDto } from '../../src/balance/dto/refund.dto';
import { TransactionResponseDto } from '../../src/balance/dto/transaction-response.dto';
import { TransactionListResponseDto } from '../../src/balance/dto/transaction-list-response.dto';
import { BalanceResponseDto } from '../../src/balance/dto/balance-response.dto';

export class BalanceHelper {
  constructor(private readonly request: request.SuperTest<request.Test>) {}

  deposit(
    accessToken: string,
    dto: DepositDto,
  ): Promise<TestResponse<TransactionResponseDto>> {
    return this.request
      .post('/auth/balance/deposit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto);
  }

  reserve(
    accessToken: string,
    dto: ReserveDto,
  ): Promise<TestResponse<TransactionResponseDto>> {
    return this.request
      .post('/auth/balance/reserve')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto);
  }

  release(
    accessToken: string,
    dto: ReleaseDto,
  ): Promise<TestResponse<TransactionResponseDto>> {
    return this.request
      .post('/auth/balance/release')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto);
  }

  refund(
    accessToken: string,
    dto: RefundDto,
  ): Promise<TestResponse<TransactionResponseDto>> {
    return this.request
      .post('/auth/balance/refund')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto);
  }

  getBalance(accessToken: string): Promise<TestResponse<BalanceResponseDto>> {
    return this.request
      .get('/auth/balance')
      .set('Authorization', `Bearer ${accessToken}`);
  }

  getTransactions(
    accessToken: string,
    query?: { page?: number; limit?: number },
  ): Promise<TestResponse<TransactionListResponseDto>> {
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
