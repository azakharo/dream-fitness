import { ConflictException } from '@nestjs/common';

export class NoAvailableSlotsException extends ConflictException {
  constructor(trainingId: string) {
    super(`No available slots for training ${trainingId}`);
  }
}
