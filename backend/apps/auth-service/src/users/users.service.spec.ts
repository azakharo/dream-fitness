import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { UserAlreadyExistsException } from '../common/exceptions/user-already-exists.exception';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: any;

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

  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    findByIdWithBalance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return UserResponseDto for existing ID', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserById('user-1');

      expect(result).toEqual(mockUserResponse);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: [
          'id',
          'email',
          'name',
          'phone',
          'birthDate',
          'gender',
          'role',
          'balance',
          'status',
          'createdAt',
        ],
      });
    });

    it('should return undefined for non-existing ID', async () => {
      mockUserRepository.findOne.mockResolvedValue(undefined);

      const result = await service.getUserById('non-existing-id');

      expect(result).toBeUndefined();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existing-id' },
        select: [
          'id',
          'email',
          'name',
          'phone',
          'birthDate',
          'gender',
          'role',
          'balance',
          'status',
          'createdAt',
        ],
      });
    });
  });

  describe('updateUserProfile', () => {
    it('should update user name and return updated UserResponseDto', async () => {
      const updateUserDto = {
        name: 'Updated Name',
      };
      mockUserRepository.update.mockResolvedValue(undefined);
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      });

      const result = await service.updateUserProfile('user-1', updateUserDto);

      expect(result).toEqual({
        ...mockUserResponse,
        name: 'Updated Name',
      });
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-1', {
        name: 'Updated Name',
      });
    });

    it('should return undefined for non-existing ID', async () => {
      const updateUserDto = {
        name: 'Updated Name',
      };
      mockUserRepository.update.mockResolvedValue(undefined);
      mockUserRepository.findOne.mockResolvedValue(undefined);

      const result = await service.updateUserProfile('non-existing-id', updateUserDto);

      expect(result).toBeUndefined();
    });
  });

  describe('getUserBalance', () => {
    it('should return { balance: number } for existing user', async () => {
      mockUserRepository.findByIdWithBalance.mockResolvedValue({
        ...mockUser,
        balance: 100,
      });

      const result = await service.getUserBalance('user-1');

      expect(result).toEqual({ balance: 100 });
      expect(mockUserRepository.findByIdWithBalance).toHaveBeenCalledWith('user-1');
    });

    it('should return { balance: 0 } for non-existing user', async () => {
      mockUserRepository.findByIdWithBalance.mockResolvedValue(undefined);

      const result = await service.getUserBalance('non-existing-id');

      expect(result).toEqual({ balance: 0 });
      expect(mockUserRepository.findByIdWithBalance).toHaveBeenCalledWith('non-existing-id');
    });
  });
});
