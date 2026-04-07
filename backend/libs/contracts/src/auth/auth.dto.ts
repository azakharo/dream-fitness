import {
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
  IsOptional,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['client', 'admin'])
  role: 'client' | 'admin';
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class UserDto {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
  balance: number;
  createdAt: Date;
}

export class UserProfileDto {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UpdateBalanceDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
