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
import { UserGender, UserRole, UserStatus } from '@app/shared/enums';
import { User } from 'apps/auth-service/src/users/entities/user.entity';

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

export class LoginResponseBody {
  accessToken: string;
  refreshToken: string;
}

export class LogoutResponseBody {
  message: string;
}

export class RegisterResponseBody {
  user: Omit<User, 'password'>;
  tokens: LoginResponseBody;
}
