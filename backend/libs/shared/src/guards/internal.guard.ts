import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Check for internal headers from Gateway
    const userId = request.headers['x-user-id'];
    const userRole = request.headers['x-user-role'];

    if (!userId || !userRole) {
      throw new UnauthorizedException('Missing internal auth headers');
    }

    // Attach user to request
    request.user = {
      id: userId,
      role: userRole,
    };

    return true;
  }
}
