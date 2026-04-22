import * as request from 'supertest';
import { TestResponse } from './auth.helper';
import { UserResponseDto } from '../../src/users/dto/user-response.dto';
import { UpdateUserDto } from '../../src/users/dto/update-user.dto';
import { BalanceResponseDto } from '../../src/users/dto/balance-response.dto';

export class ProfileHelper {
  constructor(private readonly request: request.SuperTest<request.Test>) {}

  getMe(
    headers: Record<string, string>,
  ): Promise<TestResponse<UserResponseDto>> {
    return this.request.get('/auth/me').set(headers);
  }

  updateMe(
    headers: Record<string, string>,
    dto: UpdateUserDto,
  ): Promise<TestResponse<UserResponseDto>> {
    return this.request.patch('/auth/me').set(headers).send(dto);
  }

  getBalance(
    headers: Record<string, string>,
  ): Promise<TestResponse<BalanceResponseDto>> {
    return this.request.get('/auth/balance').set(headers);
  }
}
