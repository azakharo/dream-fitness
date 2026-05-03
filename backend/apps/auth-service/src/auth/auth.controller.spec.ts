import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from '@app/contracts';
import { LoginDto } from '@app/contracts';
import { UserGender, InternalGuard } from '@app/shared';
import type { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  const mockInternalGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockTokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  const mockRes = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(InternalGuard)
      .useValue(mockInternalGuard)
      .compile();

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

    it('should register user and set refresh token cookie', async () => {
      const result = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        tokens: mockTokens,
      };
      mockAuthService.register.mockResolvedValue(result);

      const response = await controller.register(
        registerDto,
        mockRes as unknown as Response,
      );

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        mockTokens.refreshToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        }),
      );
      expect(response).toEqual({
        user: result.user,
        accessToken: result.tokens.accessToken,
      });
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return only accessToken and set refresh token cookie', async () => {
      mockAuthService.login.mockResolvedValue(mockTokens);

      const response = await controller.login(
        loginDto,
        mockRes as unknown as Response,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        mockTokens.refreshToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        }),
      );
      expect(response).toEqual({ accessToken: mockTokens.accessToken });
    });
  });

  describe('refresh', () => {
    it('should return new accessToken and reset cookie', async () => {
      const mockReq = {
        cookies: { refreshToken: 'valid-refresh-token' },
      } as unknown as Request;

      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      mockAuthService.refresh.mockResolvedValue(newTokens);

      const response = await controller.refresh(
        mockReq,
        mockRes as unknown as Response,
      );

      expect(mockAuthService.refresh).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        newTokens.refreshToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        }),
      );
      expect(response).toEqual({ accessToken: newTokens.accessToken });
    });

    it('should throw error when no refresh token in cookies', async () => {
      const mockReq = {
        cookies: {},
      } as unknown as Request;

      await expect(
        controller.refresh(mockReq, mockRes as unknown as Response),
      ).rejects.toThrow('Refresh token not found in cookies');
    });
  });

  describe('logout', () => {
    it('should clear refresh token cookie and return message', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const response = await controller.logout(mockRes as unknown as Response);

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        }),
      );
      expect(response).toEqual({ message: 'Logout successful' });
    });
  });
});
