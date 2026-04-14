import { NotFoundException } from '@nestjs/common';

export class TrainingNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Training with ID ${id} not found`);
  }
}
