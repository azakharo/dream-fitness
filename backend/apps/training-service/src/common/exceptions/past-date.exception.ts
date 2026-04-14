import { BadRequestException } from '@nestjs/common';

export class PastDateException extends BadRequestException {
  constructor() {
    super('Cannot create training in the past');
  }
}
