import { Request } from 'express';
import { UserRole } from '../enums';

/**
 * Represents the authenticated user object extracted from JWT payload
 * This is the actual shape of data returned by JwtStrategy.validate()
 * or InternalGuard
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * JWT payload interface
 * Contains standard JWT claims with user information
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

/**
 * Extended Request interface that includes the authenticated user
 * Use this when typing request objects in guards and interceptors
 */
export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}
