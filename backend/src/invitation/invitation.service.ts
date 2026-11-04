import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { generateCode } from './invitation-code';
import type { Invitation } from '../../generated/prisma/client';

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  // コードを1枚作る。期限は作ってから1ヶ月
  // nowは、テストで時刻を決められるように受け取る(省略したら今)
  async create(userId: string, now = new Date()): Promise<Invitation> {
    if (!(await this.userService.isPremium(userId))) {
      throw new ForbiddenException(
        '招待コードを作れるのは、招待で登録した人だけです',
      );
    }

    // サーバの場所で日付がずれないように、UTCで1ヶ月足す
    const expiresAt = new Date(now);
    expiresAt.setUTCMonth(expiresAt.getUTCMonth() + 1);
    // 8文字で約1兆通りあるので、前に作ったコードとぶつかる心配はしない
    return this.prisma.invitation.create({
      data: { code: generateCode(), createdById: userId, expiresAt },
    });
  }
}
