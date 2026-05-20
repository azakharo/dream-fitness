import {
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@app/shared';

export class TinkoffWebhookDto {
  @ApiProperty({ description: 'Terminal identifier' })
  @IsString()
  TerminalKey: string;

  @ApiProperty({ description: 'Payment ID in Tinkoff' })
  @IsString()
  PaymentId: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'CONFIRMED',
    enum: ['AUTHORIZED', 'CONFIRMED', 'REJECTED'],
  })
  @IsString()
  Status: string;

  @ApiProperty({ description: 'Amount in kopeks' })
  @IsNumber()
  Amount: number;

  @ApiProperty({ description: 'Our payment UUID' })
  @IsString()
  OrderId: string;

  @ApiProperty({ description: 'SHA256 signature' })
  @IsString()
  Token: string;

  @ApiProperty({ description: 'Success flag' })
  @IsBoolean()
  Success: boolean;

  @ApiPropertyOptional({ description: 'Error code if failed' })
  @IsOptional()
  @IsString()
  ErrorCode?: string;

  @ApiPropertyOptional({ description: 'Error message' })
  @IsOptional()
  @IsString()
  Message?: string;

  @ApiPropertyOptional({ description: 'Error details' })
  @IsOptional()
  @IsString()
  Details?: string;
}

export class TinkoffWebhookResponseDto {
  @ApiProperty({ example: 'OK', description: 'Must return OK to Tinkoff' })
  status: 'OK';
}

export class InitPaymentDto {
  @ApiProperty({
    example: 100,
    minimum: 1,
    description: 'Amount in points (integer)',
  })
  @IsInt()
  @Min(1)
  amount: number;
}

export class InitPaymentResponseDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  paymentId: string;

  @ApiProperty({ example: 'https://securepay.tinkoff.ru/...' })
  paymentUrl: string;
}

export class PaymentStatusResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 100 })
  amount: number;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty()
  createdAt: string;
}

export class PaymentHistoryResponseDto {
  @ApiProperty({ type: [PaymentStatusResponseDto] })
  payments: PaymentStatusResponseDto[];

  @ApiProperty({ example: 25 })
  total: number;
}

export class GetPaymentHistoryQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
