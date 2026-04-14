import * as request from 'supertest';
import { TestResponse } from './auth.helper';
import { UserResponseDto } from '../../src/users/dto/user-response.dto';
import { UpdateUserDto } from '../../src/users/dto/update-user.dto';
import { BalanceResponseDto } from '../../src/users/dto/balance-response.dto';

export class ProfileHelper {
  constructor(private readonly request: request.SuperTest<request.Test>) {}

  getMe(accessToken: string): Promise<TestResponse<UserResponseDto>> {
    return this.request
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
  }

  updateMe(
    accessToken: string,
    dto: UpdateUserDto,
  ): Promise<TestResponse<UserResponseDto>> {
    return this.request
      .patch('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto);
  }

  getBalance(accessToken: string): Promise<TestResponse<BalanceResponseDto>> {
    return this.request
      .get('/auth/balance')
      .set('Authorization', `Bearer ${accessToken}`);
  }
}
