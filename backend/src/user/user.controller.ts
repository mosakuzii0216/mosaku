import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 画面の出し分けに要るものだけ返す。idはCookieの中身なので返さない。
  @Get()
  async me(@CurrentUser() user: { id: string }) {
    return { hasPasskey: await this.userService.hasPasskey(user.id) };
  }
}
