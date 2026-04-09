import { ForbiddenException } from '@nestjs/common';

export class UserBlockedException extends ForbiddenException {
  constructor() {
    super('User account is blocked');
  }
}
