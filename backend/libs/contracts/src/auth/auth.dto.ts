import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsNumber,
  IsPositive,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserGender, UserRole, UserStatus } from '@app/shared/enums';

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
  @Type(() => Date)
  @IsDate()
  birthDate?: Date;

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
  role: UserRole;
  balance: number;
  status: UserStatus;
  createdAt: Date;
}

export class UserProfileDto {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  birthDate: Date | null;
  gender: UserGender | null;
  role: UserRole;
  balance: number;
  status: UserStatus;
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
