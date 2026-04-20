import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';

interface AuthenticatedUserWithRole {
  id: string;
  email: string;
  role?: string;
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUserWithRole | undefined;

    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
