import { ConflictException } from '@nestjs/common';

export class TrainerAlreadyExistsException extends ConflictException {
  constructor(name: string) {
    super(`Trainer with name "${name}" already exists`);
  }
}
