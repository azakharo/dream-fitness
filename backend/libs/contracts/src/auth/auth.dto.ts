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
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserGender, UserRole, UserStatus } from '@app/shared/enums';
import { TransactionResponseDto } from './transaction.dto';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8, maxLength: 50 })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8, maxLength: 50 })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @ApiProperty({ example: 'John Doe', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ enum: UserGender })
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;
}

// RefreshTokenDto removed - refresh token is now stored in HTTP-only cookies

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  phone: string | null;

  @ApiPropertyOptional()
  birthDate: string | null;

  @ApiPropertyOptional({ enum: UserGender })
  gender: UserGender | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  balance: number;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  createdAt: string;
}

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  phone: string | null;

  @ApiPropertyOptional()
  birthDate: string | null;

  @ApiPropertyOptional({ enum: UserGender })
  gender: UserGender | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  balance: number;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  createdAt: string;
}

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  phone: string | null;

  @ApiPropertyOptional()
  birthDate: string | null;

  @ApiPropertyOptional({ enum: UserGender })
  gender: UserGender | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  balance: number;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class UpdateBalanceDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 100, minimum: 0 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ example: 'Deposit for training' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class LoginResponseBody {
  @ApiProperty({ example: 'jwt-access-token' })
  accessToken: string;
}

export class LogoutResponseBody {
  @ApiProperty({ example: 'Logged out successfully' })
  message: string;
}

export class RegisterResponseBody {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: UserResponseDto;
}

export class RefreshResponseBody {
  @ApiProperty({ example: 'jwt-access-token' })
  accessToken: string;
}

export class BalanceResponseDto {
  @ApiProperty({ example: 1500 })
  balance!: number;
}

export class TransactionListResponseDto {
  @ApiProperty({ type: [TransactionResponseDto] })
  items!: TransactionResponseDto[];

  @ApiProperty({ example: 25 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;
}
