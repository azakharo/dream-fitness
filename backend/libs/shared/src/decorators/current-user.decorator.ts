import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract the current user from the request
 * Can be used with or without specifying a property
 *
 * @example
 * // Get entire user object
 * @CurrentUser() user: UserDto
 *
 * @example
 * // Get specific property
 * @CurrentUser('id') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
