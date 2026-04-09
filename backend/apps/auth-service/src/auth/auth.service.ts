import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';

import { UserRepository } from '../users/repositories/user.repository';
import { ConfigService } from '../config';
import { User } from '../users/entities/user.entity';
import { LoginDto, RegisterDto, LoginResponseDto } from '@app/contracts';
import type { StringValue } from 'ms';
import { JwtPayload } from '@app/shared';
import { EventsPublisher } from '../events/events.publisher';
import { UserAlreadyExistsException } from '../common/exceptions/user-already-exists.exception';
import { InvalidCredentialsException } from '../common/exceptions/invalid-credentials.exception';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventsPublisher: EventsPublisher,
  ) {}

  async register(
    createUserDto: RegisterDto,
  ): Promise<{ user: User; tokens: LoginResponseDto }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new UserAlreadyExistsException(createUserDto.email);
    }

    // Hash password
    const passwordHash = await this.hashPassword(createUserDto.password);

    // Create user entity
    const user = this.userRepository.create({
      email: createUserDto.email,
      password: passwordHash,
      name: createUserDto.name,
      phone: createUserDto.phone || null,
      birthDate: createUserDto.birthDate
        ? new Date(createUserDto.birthDate)
        : null,
      gender: createUserDto.gender || null,
    });

    // Save user
    await this.userRepository.save(user);

    // Publish user.created event
    await this.eventsPublisher.publishUserCreated({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.validatePassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    return this.generateTokens(user);
  }

  async refresh(refreshToken: string): Promise<LoginResponseDto> {
    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(refreshToken);
      const user = await this.userRepository.findByIdWithBalance(payload.sub);
      if (!user) {
        throw new Error('User not found');
      }

      return this.generateTokens(user);
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(): Promise<void> {
    // For simplicity, we'll just return - in a real app, you'd invalidate the refresh token
    // This could be implemented with a cache of revoked tokens
  }

  generateTokens(user: User): LoginResponseDto {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_TTL') as StringValue,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_TTL') as StringValue,
    });

    return { accessToken, refreshToken };
  }

  async hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }
}
