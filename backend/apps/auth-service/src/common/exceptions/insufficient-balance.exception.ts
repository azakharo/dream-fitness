import { ConflictException } from '@nestjs/common';

export class InsufficientBalanceException extends ConflictException {
  constructor(currentBalance: number, required: number) {
    super(`Insufficient balance: ${currentBalance} < ${required}`);
  }
}
