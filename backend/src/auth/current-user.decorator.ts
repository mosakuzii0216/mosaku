import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '../../generated/prisma/client';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request.user) {
      throw new Error('AnonymousUserMiddleware が動いていません');
    }
    return request.user;
  },
);
