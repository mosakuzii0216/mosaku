import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../user/user.service';

export const USER_COOKIE = 'mosaku_uid';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

@Injectable()
export class AnonymousUserMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // 署名が壊れているとfalseが入る。stringのときだけ信じる
    const signed = req.signedCookies?.[USER_COOKIE];
    const user = await this.userService.findOrCreate(
      typeof signed === 'string' ? signed : undefined,
    );

    res.cookie(USER_COOKIE, user.id, {
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ONE_YEAR_MS,
      path: '/',
    });

    req.user = user;
    next();
  }
}
