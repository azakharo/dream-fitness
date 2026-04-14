import { BadRequestException } from '@nestjs/common';

export class TrainingAlreadyCancelledException extends BadRequestException {
  constructor(id: string) {
    super(`Training with ID ${id} is already cancelled`);
  }
}
