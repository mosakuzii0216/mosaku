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
import { clearUserCookie, setUserCookie } from '../auth/user-cookie';

@Controller('me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 画面の出し分けに要るものだけ返す。idはCookieの中身なので返さない。
  @Get()
  async me(
    @CurrentUser() user: { id: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    // 画面を開くたびに呼ばれるので、ここで名札を付け直して期限を延ばす
    setUserCookie(res, user.id);
    const [hasPasskey, hasGoogle, isPremium] = await Promise.all([
      this.userService.hasPasskey(user.id),
      this.userService.hasGoogle(user.id),
      this.userService.isPremium(user.id),
    ]);
    return { hasPasskey, hasGoogle, isPremium };
  }

  // 名札を消すだけ。ユーザとメモはサーバに残るので、パスキーがGoogleでまた入れる
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    clearUserCookie(res);
  }
}
