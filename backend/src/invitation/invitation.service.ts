import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { generateCode } from './invitation-code';
import type { Invitation } from '../../generated/prisma/client';

// 1人が持てるコードの数。開発者は上限無し
const LIMIT = 3;

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
    if ((await this.remaining(userId, now)) === 0) {
      throw new ForbiddenException('招待コードは3枚までです');
    }

    // サーバの場所で日付がずれないように、UTCで1ヶ月足す
    const expiresAt = new Date(now);
    expiresAt.setUTCMonth(expiresAt.getUTCMonth() + 1);
    // 8文字で約1兆通りあるので、前に作ったコードとぶつかる心配はしない
    return this.prisma.invitation.create({
      data: { code: generateCode(), createdById: userId, expiresAt },
    });
  }

  // あと何枚作れるか。開発者は上限が無いのでnull
  // 取り消した分と、使われないまま期限が切れた分は数えない
  async remaining(userId: string, now = new Date()): Promise<number | null> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (user.isDeveloper) return null;

    const count = await this.prisma.invitation.count({
      where: {
        createdById: userId,
        revokedAt: null,
        OR: [{ usedAt: { not: null } }, { expiresAt: { gt: now } }],
      },
    });
    return Math.max(LIMIT - count, 0);
  }

  // 取り消せるのは、自分が作った、まだ使われていないコードだけ
  async revoke(userId: string, id: string, now = new Date()): Promise<void> {
    const { count } = await this.prisma.invitation.updateMany({
      where: { id, createdById: userId, usedAt: null, revokedAt: null },
      data: { revokedAt: now },
    });
    if (count === 0) {
      throw new NotFoundException('取り消せるコードが見つかりません');
    }
  }
}
