import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { EventsPublisher } from '../events/events.publisher';
import { UserAlreadyExistsException } from '../common/exceptions/user-already-exists.exception';
import { InvalidCredentialsException } from '../common/exceptions/invalid-credentials.exception';
import { InvalidRefreshTokenException } from '../common/exceptions/invalid-refresh-token.exception';
import { RegisterDto } from '@app/contracts';
import { LoginDto } from '@app/contracts';
import { LoginResponseDto } from '@app/contracts';
import { JwtPayload } from '@app/shared';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let jwtService: any;
  let configService: any;
  let eventsPublisher: any;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    name: 'Test User',
    phone: '+1234567890',
    birthDate: new Date('1990-01-01'),
    gender: 'male',
    role: 'client',
    balance: 100,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokens: LoginResponseDto = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_ACCESS_TTL') return '15m';
      if (key === 'JWT_REFRESH_TTL') return '7d';
      return '';
    }),
  };

  const mockEventsPublisher = {
    publishUserCreated: jest.fn().mockResolvedValue(undefined),
  };

  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findByIdWithBalance: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EventsPublisher, useValue: mockEventsPublisher },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    eventsPublisher = module.get(EventsPublisher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      phone: '+1234567890',
      birthDate: '1990-01-01',
      gender: 'male',
    };

    it('should successfully register a new user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.register(registerDto);

      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        phone: mockUser.phone,
        birthDate: mockUser.birthDate,
        gender: mockUser.gender,
        role: mockUser.role,
        balance: mockUser.balance,
        status: mockUser.status,
        createdAt: mockUser.createdAt.toISOString(),
      });
      expect(result.tokens).toEqual(mockTokens);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: expect.any(String),
        name: registerDto.name,
        phone: registerDto.phone,
        birthDate: new Date(registerDto.birthDate),
        gender: registerDto.gender,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(eventsPublisher.publishUserCreated).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
    });

    it('should throw UserAlreadyExistsException when user already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        UserAlreadyExistsException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'User with email test@example.com already exists',
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login and return tokens', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(result).toEqual(mockTokens);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should throw InvalidCredentialsException when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(undefined);

      await expect(service.login(loginDto)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });

    it('should throw InvalidCredentialsException when password is wrong', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      await expect(service.login(loginDto)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });

  describe('refresh', () => {
    const refreshToken = 'valid-refresh-token';

    it('should successfully refresh tokens', async () => {
      const payload: JwtPayload = {
        sub: 'user-1',
        email: 'test@example.com',
        role: 'client',
      };
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockUserRepository.findByIdWithBalance.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refresh(refreshToken);

      expect(result).toEqual(mockTokens);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(refreshToken);
      expect(mockUserRepository.findByIdWithBalance).toHaveBeenCalledWith(
        'user-1',
      );
    });

    it('should throw InvalidRefreshTokenException when token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        InvalidRefreshTokenException,
      );
    });

    it('should throw error when user not found', async () => {
      const payload: JwtPayload = {
        sub: 'user-1',
        email: 'test@example.com',
        role: 'client',
      };
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockUserRepository.findByIdWithBalance.mockResolvedValue(undefined);

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('logout', () => {
    it('should logout without error', async () => {
      await expect(service.logout()).resolves.not.toThrow();
    });
  });

  describe('generateTokens', () => {
    it('should call JwtService.sign twice', () => {
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      service.generateTokens(mockUser);

      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        1,
        { sub: mockUser.id, email: mockUser.email, role: mockUser.role },
        { expiresIn: '15m' },
      );
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        2,
        { sub: mockUser.id, email: mockUser.email, role: mockUser.role },
        { expiresIn: '7d' },
      );
    });
  });

  describe('hashPassword', () => {
    it('should return bcrypt hash', async () => {
      const password = 'password123';
      const hash = 'hashed-password';

      jest.spyOn(require('bcrypt'), 'hash').mockResolvedValue(hash);

      const result = await service.hashPassword(password);

      expect(result).toBe(hash);
      expect(require('bcrypt').hash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('validatePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'password123';
      const hash = 'hashed-password';

      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      const result = await service.validatePassword(password, hash);

      expect(result).toBe(true);
      expect(require('bcrypt').compare).toHaveBeenCalledWith(password, hash);
    });

    it('should return false for wrong password', async () => {
      const password = 'wrong-password';
      const hash = 'hashed-password';

      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      const result = await service.validatePassword(password, hash);

      expect(result).toBe(false);
      expect(require('bcrypt').compare).toHaveBeenCalledWith(password, hash);
    });
  });
});
