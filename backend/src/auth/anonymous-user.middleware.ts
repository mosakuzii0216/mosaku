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
    const current = typeof signed === 'string' ? signed : undefined;
    const user = await this.userService.findOrCreate(current);

    // Cookieが無い・壊れている・もうDBに居ないときだけ発行する
    // 毎回発行すると、遅れて届いた古い返事が新しいCookieを上書きしてしまう
    if (user.id !== current) {
      res.cookie(USER_COOKIE, user.id, {
        httpOnly: true,
        signed: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: ONE_YEAR_MS,
        path: '/',
      });
    }

    req.user = user;
    next();
  }
}
