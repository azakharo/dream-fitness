import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsNumber,
  IsPositive,
  IsDateString,
} from 'class-validator';
import { UserGender } from '@app/shared/enums';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class UserDto {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  birthDate: Date | null;
  gender: UserGender | null;
  role: 'client' | 'admin';
  balance: number;
  status: 'active' | 'blocked';
  createdAt: Date;
}

export class UserProfileDto {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  birthDate: Date | null;
  gender: UserGender | null;
  role: 'client' | 'admin';
  balance: number;
  status: 'active' | 'blocked';
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

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
}
