import { BadRequestException } from '@nestjs/common';

export class TrainerNotActiveException extends BadRequestException {
  constructor(id: string) {
    super(`Trainer with ID ${id} is not active`);
  }
}
