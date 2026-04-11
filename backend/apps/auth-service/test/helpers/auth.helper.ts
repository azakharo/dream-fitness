import request from 'supertest';
import { User } from '../../src/users/entities/user.entity';
import { RegisterDto } from '@app/contracts';

export class AuthHelper {
  constructor(private request: request.SuperTest<request.Test>) {}

  async register(
    userData: RegisterDto,
  ): Promise<{ user: Omit<User, 'password'>; tokens: { accessToken: string; refreshToken: string } }> {
    const response = await this.request.post('/auth/register').send(userData);
    return response.body;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await this.request.post('/auth/login').send({ email, password });
    return response.body;
  }

  async registerAndLogin(
    userData: RegisterDto,
  ): Promise<{ accessToken: string; refreshToken: string; userId: string }> {
    const registerResponse = await this.register(userData);
    const loginResponse = await this.login(userData.email, userData.password);
    return {
      accessToken: loginResponse.accessToken,
      refreshToken: loginResponse.refreshToken,
      userId: registerResponse.user.id,
    };
  }
}
