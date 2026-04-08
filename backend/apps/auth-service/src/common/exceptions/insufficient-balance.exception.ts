import { BadRequestException } from '@nestjs/common';

export class InsufficientBalanceException extends BadRequestException {
  constructor(currentBalance: number, required: number) {
    super(`Insufficient balance: ${currentBalance} < ${required}`);
  }
}
