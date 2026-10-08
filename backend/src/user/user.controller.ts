import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { USER_COOKIE } from '../auth/anonymous-user.middleware';

@Controller('me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 画面の出し分けに要るものだけ返す。idはCookieの中身なので返さない。
  @Get()
  async me(@CurrentUser() user: { id: string }) {
    const [hasPasskey, hasGoogle] = await Promise.all([
      this.userService.hasPasskey(user.id),
      this.userService.hasGoogle(user.id),
    ]);
    return { hasPasskey, hasGoogle };
  }

  // 名札を消すだけ。ユーザとメモはサーバに残るので、パスキーがGoogleでまた入れる
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(USER_COOKIE, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }
}
