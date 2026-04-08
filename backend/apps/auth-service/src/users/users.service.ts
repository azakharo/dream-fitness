import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial } from 'typeorm';
import { UserRepository } from './repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      birthDate: user.birthDate,
      gender: user.gender,
      role: user.role,
      balance: user.balance,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new Error(`User with email ${createUserDto.email} already exists`);
    }

    // For now, just create a user with basic properties
    // In a real implementation, you'd hash the password and save properly
    const user = this.userRepository.create(createUserDto as DeepPartial<User>);
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
    await this.userRepository.update(id, updateUserDto as DeepPartial<User>);
    return this.getUserById(id);
  }

  async getUserBalance(id: string): Promise<{ balance: number }> {
    const user = await this.userRepository.findByIdWithBalance(id);
    return { balance: user?.balance || 0 };
  }
}
