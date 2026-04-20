import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from '@app/contracts';
import { LoginDto } from '@app/contracts';
import { RefreshTokenDto } from '@app/contracts';
import { LoginResponseBody } from '@app/contracts';
import { UserGender } from '@app/shared';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  const mockTokens: LoginResponseBody = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      phone: '+1234567890',
      birthDate: '1990-01-01',
      gender: UserGender.MALE,
    };

    it('should call authService.register with correct args', async () => {
      const result = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        tokens: mockTokens,
      };
      mockAuthService.register.mockResolvedValue(result);

      const response = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(response).toEqual(result);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return { accessToken, refreshToken }', async () => {
      mockAuthService.login.mockResolvedValue(mockTokens);

      const response = await controller.login(loginDto);

      expect(response).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refresh', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('should return new tokens', async () => {
      const newTokens: LoginResponseBody = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      mockAuthService.refresh.mockResolvedValue(newTokens);

      const response = await controller.refresh(refreshTokenDto);

      expect(response).toEqual({
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      });
      expect(mockAuthService.refresh).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
    });
  });

  describe('logout', () => {
    it('should return { message: "Logout successful" }', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const response = await controller.logout();

      expect(response).toEqual({ message: 'Logout successful' });
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });
});
