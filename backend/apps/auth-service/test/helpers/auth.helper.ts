import request from 'supertest';
import { User } from '../../src/users/entities/user.entity';
import { LoginResponseDto, RegisterDto } from '@app/contracts';

type RegisterResponse = {
  user: Omit<User, 'password'>;
  tokens: LoginResponseDto;
};

export class AuthHelper {
  constructor(private request: request.SuperTest<request.Test>) {}

  async register(userData: RegisterDto): Promise<RegisterResponse> {
    const response = await this.request.post('/auth/register').send(userData);
    expect(response.status).toBe(201);
    return response.body as RegisterResponse;
  }

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const response = await this.request
      .post('/auth/login')
      .send({ email, password });
    expect(response.status).toBe(200);
    return response.body as LoginResponseDto;
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
