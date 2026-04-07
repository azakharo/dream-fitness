import { Request } from 'express';
import { UserDto } from '@app/contracts';

/**
 * Extended Request interface that includes the authenticated user
 * Use this when typing request objects in guards and interceptors
 */
export interface RequestWithUser extends Request {
  user: UserDto;
}
