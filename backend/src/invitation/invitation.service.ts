import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { formatCode, generateCode } from './invitation-code';
import type { Invitation } from '../../generated/prisma/client';

// 1人が持てるコードの数。開発者は上限無し
const LIMIT = 3;

// コードの状態：まだ・使われた・期限切れ・取り消し
export type InvitationStatus = 'unused' | 'used' | 'expired' | 'revoked';

// 取り消し → 使われた → 期限切れ → まだ、の」順に見る
function statusOf(invitation: Invitation, now: Date): InvitationStatus {
  if (invitation.revokedAt) return 'revoked';
  if (invitation.usedAt) return 'used';
  if (invitation.expiresAt <= now) return 'expired';
  return 'unused';
}

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
      data: {
        code: generateCode(),
        createdById: userId,
        // 作った日も、期限と同じnowで決める
        createdAt: now,
        expiresAt,
      },
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

  // 自分が作ったコードの一覧。新しい順に、状態を付けて返す
  async list(userId: string, now = new Date()) {
    const invitations = await this.prisma.invitation.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
    });
    // 使った人のIDなどは、画面に渡さない
    return invitations.map((invitation) => ({
      id: invitation.id,
      code: formatCode(invitation.code),
      expiresAt: invitation.expiresAt,
      status: statusOf(invitation, now),
    }));
  }
}
