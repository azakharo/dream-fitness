import { RegisterDto } from '@app/contracts';
import { DepositDto } from '../../src/balance/dto/deposit.dto';
import { ReserveDto } from '../../src/balance/dto/reserve.dto';
import { ReleaseDto } from '../../src/balance/dto/release.dto';
import { RefundDto } from '../../src/balance/dto/refund.dto';

export function createRegisterDto(
  overrides?: Partial<RegisterDto>,
): RegisterDto {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  return {
    email: `test-${uniqueId}@example.com`,
    password: 'test12345',
    name: 'Test User',
    ...overrides,
  };
}

export function createDepositDto(overrides?: Partial<DepositDto>): DepositDto {
  return {
    userId: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
    amount: 100,
    ...overrides,
  };
}

export function createReserveDto(overrides?: Partial<ReserveDto>): ReserveDto {
  return {
    userId: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
    bookingId: 'b2c3d4e5-f6a7-4890-b123-456789abcdef',
    amount: 50,
    ...overrides,
  };
}

export function createReleaseDto(overrides?: Partial<ReleaseDto>): ReleaseDto {
  return {
    userId: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
    bookingId: 'b2c3d4e5-f6a7-4890-b123-456789abcdef',
    amount: 50,
    ...overrides,
  };
}

export function createRefundDto(overrides?: Partial<RefundDto>): RefundDto {
  return {
    userId: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
    bookingId: 'b2c3d4e5-f6a7-4890-b123-456789abcdef',
    amount: 50,
    ...overrides,
  };
}
