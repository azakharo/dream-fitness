import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { EventsPublisher } from '../events/events.publisher';
import { UserGender, UserRole, UserStatus } from '@app/shared';
import { UserRepository } from '../users/repositories/user.repository';
import { hash } from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    name: 'Test User',
    phone: '+1234567890',
    birthDate: new Date('1990-01-01'),
    gender: UserGender.MALE,
    role: UserRole.CLIENT,
    balance: 100,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
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
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EventsPublisher, useValue: mockEventsPublisher },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      const expectedHash = 'hashed-password';

      jest.mocked(hash).mockResolvedValue(expectedHash as never);

      const result = await service.hashPassword(password);

      expect(result).toBe(expectedHash);
      expect(hash).toHaveBeenCalledWith(password, 10);
    });
  });
});
