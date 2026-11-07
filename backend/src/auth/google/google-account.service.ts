import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../../user/user.service';
import {
  InvitationError,
  InvitationService,
} from '../../invitation/invitation.service';

export type GoogleProfile = { sub: string; email?: string };

@Injectable()
export class GoogleAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly invitationService: InvitationService,
  ) {}

  // Googleの本人(sub)をmosakuのユーザに繋ぎ、そのユーザIDを返す
  async login(
    currentUserId: string,
    google: GoogleProfile,
    invite?: string,
  ): Promise<string> {
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

    // 初めてのGoogle: まだGoogleを繋いでいなければ(匿名・パスキーだけ)、そのまま紐づける
    // もうGoogleをつないだユーザ(共有の端末など)なら別人かもしれないので、新しく作る
    const userId = (await this.userService.hasGoogle(currentUserId))
      ? (await this.prisma.user.create({ data: {} })).id
      : currentUserId;

    // 招待コードがあれば、繋ぐ前に使う。使えなければ繋がずに、理由を付けて断る
    if (invite) {
      const failure = await this.invitationService.use(invite, userId);
      if (failure) throw new InvitationError(failure);
    }

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
