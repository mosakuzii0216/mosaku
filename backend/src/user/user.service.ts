import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '../../generated/prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // IDが無い、またはそのIDのユーザがDBに居ない場合は、新しく1件作って返す
  async findOrCreate(userId?: string): Promise<User> {
    if (userId) {
      const found = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (found) return found;
    }
    return this.prisma.user.create({ data: {} });
  }

  // 匿名湯＝座のメモを本登録ユーザに引き継いで、匿名ユーザを消す
  async merge(fromUserId: string, toUserId: string): Promise<void> {
    if (fromUserId === toUserId) return;

    // パスキーを持つユーザは別人なので統合しない
    if (await this.hasPasskey(fromUserId)) return;

    await this.prisma.$transaction([
      this.prisma.memo.updateMany({
        where: { userId: fromUserId },
        data: { userId: toUserId },
      }),
      this.prisma.user.delete({ where: { id: fromUserId } }),
    ]);
  }

  // パスキーを1つでも持っているか (=本登録済みか)
  async hasPasskey(userId: string): Promise<boolean> {
    const count = await this.prisma.passkey.count({ where: { userId } });
    return count > 0;
  }
}
