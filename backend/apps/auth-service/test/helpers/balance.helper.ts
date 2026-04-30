import * as request from 'supertest';
import { TestResponse } from './auth.helper';
import { DepositDto } from '../../src/balance/dto/deposit.dto';
import { ReserveDto } from '../../src/balance/dto/reserve.dto';
import { ReleaseDto } from '../../src/balance/dto/release.dto';
import { RefundDto } from '../../src/balance/dto/refund.dto';
import {
  TransactionResponseDto,
  TransactionListResponseDto,
  BalanceResponseDto,
} from '@app/contracts';

export class BalanceHelper {
  constructor(private readonly request: request.SuperTest<request.Test>) {}

  deposit(
    headers: Record<string, string>,
    dto: DepositDto,
  ): Promise<TestResponse<TransactionResponseDto>> {
    return this.request.post('/auth/balance/deposit').set(headers).send(dto);
  }

  reserve(
    headers: Record<string, string>,
    dto: ReserveDto,
  ): Promise<TestResponse<TransactionResponseDto>> {
    return this.request.post('/auth/balance/reserve').set(headers).send(dto);
  }

  release(
    headers: Record<string, string>,
    dto: ReleaseDto,
  ): Promise<TestResponse<TransactionResponseDto>> {
    return this.request.post('/auth/balance/release').set(headers).send(dto);
  }

  refund(
    headers: Record<string, string>,
    dto: RefundDto,
  ): Promise<TestResponse<TransactionResponseDto>> {
    return this.request.post('/auth/balance/refund').set(headers).send(dto);
  }

  getBalance(
    headers: Record<string, string>,
  ): Promise<TestResponse<BalanceResponseDto>> {
    return this.request.get('/auth/balance').set(headers);
  }

  getTransactions(
    headers: Record<string, string>,
    query?: { page?: number; limit?: number },
  ): Promise<TestResponse<TransactionListResponseDto>> {
    let req = this.request.get('/auth/transactions').set(headers);

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
