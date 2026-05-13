import { Injectable } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { UserRepository } from './repositories/user.repository';
import {
  RegisterDto,
  UserResponseDto,
  FindAllUsersQueryDto,
} from '@app/contracts';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserStatus } from '@app/shared';
import { UserAlreadyExistsException } from '../common/exceptions/user-already-exists.exception';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      birthDate: user.birthDate ? new Date(user.birthDate).toISOString() : null,
      gender: user.gender,
      role: user.role,
      balance: user.balance,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async createUser(registerDto: RegisterDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new UserAlreadyExistsException(registerDto.email);
    }

    const { birthDate, ...rest } = registerDto;
    const user = this.userRepository.create({
      ...rest,
      birthDate: birthDate ? new Date(birthDate) : null,
    } as DeepPartial<User>);
    const savedUser = await this.userRepository.save(user);
    return this.toResponseDto(savedUser);
  }

  async getUserById(id: string): Promise<UserResponseDto | undefined> {
    const user = await this.userRepository.findOne({
      where: { id },
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
    return user ? this.toResponseDto(user) : undefined;
  }

  async updateUserProfile(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto | undefined> {
    const { birthDate, ...rest } = updateUserDto;
    await this.userRepository.update(id, {
      ...rest,
      ...(birthDate !== undefined && {
        birthDate: birthDate ? new Date(birthDate) : null,
      }),
    } as DeepPartial<User>);
    return this.getUserById(id);
  }

  async getUserBalance(id: string): Promise<{ balance: number }> {
    const user = await this.userRepository.findByIdWithBalance(id);
    return { balance: user?.balance || 0 };
  }

  async getUserEmailById(id: string): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['email'],
    });
    return user?.email || null;
  }

  async getUserNameById(id: string): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['name'],
    });
    return user?.name || null;
  }

  async findAll(
    query: FindAllUsersQueryDto,
  ): Promise<{ users: UserResponseDto[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    // Parse comma-separated ids into array
    let ids: string[] | undefined;
    if (query.ids) {
      ids = query.ids
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    }

    const { users, total } = await this.userRepository.findAllWithFilters({
      page,
      limit,
      status: query.status,
      role: query.role,
      ids,
    });
    return {
      users: users.map((user) => this.toResponseDto(user)),
      total,
    };
  }

  async findById(id: string): Promise<UserResponseDto | undefined> {
    return this.getUserById(id);
  }

  async updateStatus(
    id: string,
    status: UserStatus,
  ): Promise<UserResponseDto | undefined> {
    await this.userRepository.update(id, { status } as DeepPartial<User>);
    return this.getUserById(id);
  }
}
