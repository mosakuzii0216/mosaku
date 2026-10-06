import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../../user/user.service';

export type GoogleProfile = { sub: string; email?: string };

@Injectable()
export class GoogleAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  // Googleの本人(sub)をmosakuのユーザに繋ぎ、そのユーザIDを返す
  async login(currentUserId: string, google: GoogleProfile): Promise<string> {
    const account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: google.sub,
        },
      },
    });

    if (account) {
      // 前にこのGoogleでログインしたことがある：この端末の匿名メモを引き継ぐ
      await this.userService.merge(currentUserId, account.userId);
      return account.userId;
    }

    // 初めてのGoogle: 今が匿名ならそのまま紐づける
    // もう登録済みのユーザ(共有の端末など)なら別人かもしれないので、新しく作る
    const userId = (await this.userService.isRegistered(currentUserId))
      ? (await this.prisma.user.create({ data: {} })).id
      : currentUserId;

    await this.prisma.account.create({
      data: {
        provider: 'google',
        providerAccountId: google.sub,
        email: google.email,
        userId,
      },
    });
    return userId;
  }
}
