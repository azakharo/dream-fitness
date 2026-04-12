import { BadRequestException } from '@nestjs/common';

export class InvalidRefreshTokenException extends BadRequestException {
  constructor() {
    super('Invalid refresh token');
  }
}
