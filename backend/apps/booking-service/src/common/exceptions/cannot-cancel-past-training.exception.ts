import { BadRequestException } from '@nestjs/common';

export class CannotCancelPastTrainingException extends BadRequestException {
  constructor(trainingId: string) {
    super(`Cannot cancel booking for a past training ${trainingId}`);
  }
}
