import { NotFoundException } from '@nestjs/common';

export class NotOnWaitlistException extends NotFoundException {
  constructor(userId: string, trainingId: string) {
    super(`User ${userId} is not on the waitlist for training ${trainingId}`);
  }
}
