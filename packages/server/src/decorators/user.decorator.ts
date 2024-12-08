import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { Request } from '@/types/request.type';

export const User = createParamDecorator<keyof Request['user']>(
  (data: keyof Request['user'], ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
