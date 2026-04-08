import { createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: unknown, ctx: any) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
