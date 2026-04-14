import { ConflictException } from '@nestjs/common';

export class ScheduleConflictException extends ConflictException {
  constructor(trainerId: string, scheduledAt: string) {
    super(`Trainer ${trainerId} has a schedule conflict at ${scheduledAt}`);
  }
}
