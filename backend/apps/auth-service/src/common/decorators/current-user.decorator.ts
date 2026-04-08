import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser, AuthenticatedUser } from '@app/shared';

export const CurrentUser = createParamDecorator<AuthenticatedUser>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data as keyof typeof user] : user;
  },
);
