import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * JWT Authentication Guard
 * TODO: Will be fully implemented in Phase 2 (Auth)
 * This is a placeholder that will validate JWT tokens from the auth-service
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // TODO: Implement JWT validation in Phase 2
    // For now, this is a placeholder that allows all requests
    const request = context.switchToHttp().getRequest<Request>();

    // Placeholder: Check for Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    // TODO: Validate JWT token with auth-service
    // TODO: Attach user to request object

    return true;
  }
}
