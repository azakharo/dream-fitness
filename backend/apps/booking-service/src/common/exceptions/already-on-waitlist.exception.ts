import { ConflictException } from '@nestjs/common';

export class AlreadyOnWaitlistException extends ConflictException {
  constructor(userId: string, trainingId: string) {
    super(
      `User ${userId} is already on the waitlist for training ${trainingId}`,
    );
  }
}
