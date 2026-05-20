import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@app/shared';

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
