import request from 'supertest';
import { Response } from 'supertest';
import {
  RegisterDto,
  LoginResponseBody,
  RegisterResponseBody,
  LogoutResponseBody,
} from '@app/contracts';

export type TestResponse<T> = Omit<Response, 'body'> & {
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
      .set('Cookie', [`refreshToken=${refreshToken}`]);
    return response as unknown as TestResponse<LoginResponseBody>;
  }

  /**
   * Extracts refresh token from set-cookie header
   */
  extractRefreshTokenFromCookies(
    setCookieHeader: string | string[] | undefined,
  ): string | undefined {
    if (!setCookieHeader) return undefined;
    const cookieString = Array.isArray(setCookieHeader)
      ? setCookieHeader[0]
      : setCookieHeader;
    const match = cookieString.match(/refreshToken=([^;]+)/);
    return match ? match[1] : undefined;
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

  async registerAndLoginFlat(
    userData: RegisterDto,
  ): Promise<{ accessToken: string; refreshToken: string; userId: string }> {
    const registerResponse = await this.register(userData);
    const loginResponse = await this.login(userData.email, userData.password);
    const refreshToken = this.extractRefreshTokenFromCookies(
      loginResponse.headers['set-cookie'],
    );
    return {
      accessToken: loginResponse.body.accessToken,
      refreshToken: refreshToken!,
      userId: registerResponse.body.user.id,
    };
  }

  /**
   * Returns headers for internal authentication with role 'user'
   */
  getUserHeaders(userId: string): Record<string, string> {
    return {
      'X-User-Id': userId,
      'X-User-Role': 'user',
    };
  }

  /**
   * Returns headers for internal authentication with role 'admin'
   */
  getAdminHeaders(userId: string): Record<string, string> {
    return {
      'X-User-Id': userId,
      'X-User-Role': 'admin',
    };
  }

  async logout(accessToken: string): Promise<TestResponse<LogoutResponseBody>> {
    const response = await this.request
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    return response as unknown as TestResponse<LogoutResponseBody>;
  }

  async logoutWithHeaders(
    headers: Record<string, string>,
  ): Promise<TestResponse<LogoutResponseBody>> {
    const response = await this.request.post('/auth/logout').set(headers);
    return response as unknown as TestResponse<LogoutResponseBody>;
  }
}
