import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { AuthenticatedUser } from '@app/shared';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: any;

  const mockUser: AuthenticatedUser = {
    id: 'user-1',
    email: 'test@example.com',
  };

  const mockUserResponse: UserResponseDto = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890',
    birthDate: new Date('1990-01-01'),
    gender: 'male',
    role: 'client',
    balance: 100,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  const mockBalanceResponse: BalanceResponseDto = {
    balance: 100,
    userId: 'user-1',
  };

  const mockUsersService = {
    getUserById: jest.fn(),
    updateUserProfile: jest.fn(),
    getUserBalance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return UserResponseDto with valid user', async () => {
      mockUsersService.getUserById.mockResolvedValue(mockUserResponse);

      const result = await controller.getProfile(mockUser);

      expect(result).toEqual(mockUserResponse);
      expect(mockUsersService.getUserById).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateProfile', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
    };

    it('should return updated UserResponseDto with valid DTO', async () => {
      mockUsersService.updateUserProfile.mockResolvedValue({
        ...mockUserResponse,
        name: 'Updated Name',
      });

      const result = await controller.updateProfile(mockUser, updateUserDto);

      expect(result).toEqual({
        ...mockUserResponse,
        name: 'Updated Name',
      });
      expect(mockUsersService.updateUserProfile).toHaveBeenCalledWith(
        'user-1',
        updateUserDto,
      );
    });
  });

  describe('getBalance', () => {
    it('should return { balance, userId } with valid user', async () => {
      mockUsersService.getUserBalance.mockResolvedValue({ balance: 100 });

      const result = await controller.getBalance(mockUser);

      expect(result).toEqual({
        balance: 100,
        userId: 'user-1',
      });
      expect(mockUsersService.getUserBalance).toHaveBeenCalledWith('user-1');
    });
  });
});
