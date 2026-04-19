import { ConflictException } from '@nestjs/common';

export class DuplicateBookingException extends ConflictException {
  constructor(userId: string, trainingId: string) {
    super(`User ${userId} already has a booking for training ${trainingId}`);
  }
}
