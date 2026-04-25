import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RequestWithUser } from '../interfaces';
import { UserRole } from '../enums';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

@Injectable()
export class InternalGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const userId = request.headers['x-user-id'];
    const userRole = request.headers['x-user-role'];

    if (!userId || !userRole) {
      throw new BadRequestException('Missing internal auth headers');
    }

    if (typeof userId !== 'string' || !isValidUuid(userId)) {
      throw new BadRequestException('Invalid x-user-id format');
    }

    request.user = {
      id: userId,
      role: userRole as UserRole,
      email: '',
    };

    return true;
  }
}
