import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const InternalUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    const userRole = request.headers['x-user-role'];

    if (!userId) {
      return null;
    }

    const user = { id: userId, role: userRole };
    return data ? (user as Record<string, unknown>)[data] : user;
  },
);
