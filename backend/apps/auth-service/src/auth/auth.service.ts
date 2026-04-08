import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';

import { UserRepository } from '../users/repositories/user.repository';
import { ConfigService } from '../config/config.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { StringValue } from 'ms';
import { JwtPayload } from '@app/shared/interfaces';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    createUserDto: RegisterDto,
  ): Promise<{ user: User; tokens: Tokens }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(createUserDto.password);

    // Create user entity
    const user = this.userRepository.create({
      email: createUserDto.email,
      password: passwordHash,
      name: createUserDto.name,
      phone: createUserDto.phone || null,
      birthDate: createUserDto.birthDate || null,
      gender: createUserDto.gender || null,
    });

    // Save user
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  async login(loginDto: LoginDto): Promise<Tokens> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await this.validatePassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refresh(refreshToken: string): Promise<Tokens> {
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

  validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email };
  }

  async logout(): Promise<void> {
    // For simplicity, we'll just return - in a real app, you'd invalidate the refresh token
    // This could be implemented with a cache of revoked tokens
  }

  generateTokens(user: User): Tokens {
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
