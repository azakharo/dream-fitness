import request from 'supertest';
import { Response } from 'supertest';
import {
  RegisterDto,
  LoginResponseBody,
  RegisterResponseBody,
  LogoutResponseBody,
} from '@app/contracts';

type TestResponse<T> = Omit<Response, 'body'> & {
  body: T;
};

export class AuthHelper {
  constructor(private request: request.SuperTest<request.Test>) {}

  async register(
    userData: RegisterDto,
  ): Promise<TestResponse<RegisterResponseBody>> {
    const response = await this.request.post('/auth/register').send(userData);
    return response as unknown as TestResponse<RegisterResponseBody>;
  }

  async login(
    email: string,
    password: string,
  ): Promise<TestResponse<LoginResponseBody>> {
    const response = await this.request
      .post('/auth/login')
      .send({ email, password });
    return response as unknown as TestResponse<LoginResponseBody>;
  }

  async refresh(
    refreshToken: string,
  ): Promise<TestResponse<LoginResponseBody>> {
    const response = await this.request
      .post('/auth/refresh')
      .send({ refreshToken });
    return response as unknown as TestResponse<LoginResponseBody>;
  }

  async registerAndLogin(userData: RegisterDto): Promise<{
    registerResponse: TestResponse<RegisterResponseBody>;
    loginResponse: TestResponse<LoginResponseBody>;
  }> {
    const registerResponse = await this.register(userData);
    const loginResponse = await this.login(userData.email, userData.password);
    return {
      registerResponse,
      loginResponse,
    };
  }

  async logout(accessToken: string): Promise<TestResponse<LogoutResponseBody>> {
    const response = await this.request
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    return response as unknown as TestResponse<LogoutResponseBody>;
  }
}
