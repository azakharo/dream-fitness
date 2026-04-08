import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

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
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async getUserById(id: string): Promise<UserResponseDto | undefined> {
    return this.userRepository.findOne({
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
  }

  async updateUserProfile(
    id: string,
    updateUserDto: any,
  ): Promise<UserResponseDto | undefined> {
    await this.userRepository.update(id, updateUserDto);
    return this.getUserById(id);
  }

  async getUserBalance(id: string): Promise<{ balance: number }> {
    const user = await this.userRepository.findByIdWithBalance(id);
    return { balance: user?.balance || 0 };
  }
}
