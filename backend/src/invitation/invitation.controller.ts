import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { formatCode } from './invitation-code';
import { CurrentUser } from '../auth/current-user.decorator';
import { CheckInvitationDto } from './invitation.dto';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  // 作ったコードを4-4の形で返す。作った人のIDは、画面に渡さない
  @Post()
  async create(@CurrentUser() user: { id: string }) {
    const invitation = await this.invitationService.create(user.id);
    return {
      id: invitation.id,
      code: formatCode(invitation.code),
      expiresAt: invitation.expiresAt,
    };
  }

  // 招待のモーダルに出すもの：自分のコードの一覧と、あと何枚作れるか
  @Get()
  async list(@CurrentUser() user: { id: string }) {
    const [invitations, remaining] = await Promise.all([
      this.invitationService.list(user.id),
      this.invitationService.remaining(user.id),
    ]);
    return { invitations, remaining };
  }

  // 取り消すだけなので、返事は空(204)
  @Post(':id/revoke')
  @HttpCode(204)
  revoke(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.invitationService.revoke(user.id, id);
  }

  // 打ったコードを確かめる。何かを作るわけではないので、201ではなく200で返す
  @Post('check')
  @HttpCode(200)
  async check(@Body() body: CheckInvitationDto) {
    return { reason: await this.invitationService.check(body.code) };
  }
}
