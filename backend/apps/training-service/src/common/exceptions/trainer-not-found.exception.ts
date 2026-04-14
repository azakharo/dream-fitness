import { NotFoundException } from '@nestjs/common';

export class TrainerNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Trainer with ID ${id} not found`);
  }
}
