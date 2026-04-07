import { UserDto } from '@app/contracts';

/**
 * Extended Request interface that includes the authenticated user
 * Use this when typing request objects in guards and interceptors
 */
export interface RequestWithUser {
  user: UserDto;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  query: Record<string, unknown>;
  params: Record<string, string>;
  ip: string;
  method: string;
  url: string;
  get(name: string): string | undefined;
}
