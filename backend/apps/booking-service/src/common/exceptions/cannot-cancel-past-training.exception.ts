import { ConflictException } from '@nestjs/common';

export class CannotCancelPastTrainingException extends ConflictException {
  constructor(trainingId: string) {
    super(`Cannot cancel booking for a past training ${trainingId}`);
  }
}
