import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../../user/user.service';
import {
  InvitationError,
  InvitationService,
} from '../../invitation/invitation.service';

// どこでログインしたか。DBのaccounts.providerに、この文字のまま入る
export type Provider = 'google' | 'x';

// そのサービスでの本人。idはGoogleならsub、XならユーザID
export type ProviderProfile = { id: string; email?: string };

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly invitationService: InvitationService,
  ) {}

  // GoogleやXの本人をmosakuのユーザに繋ぎ、そのユーザIDを返す
  async login(
    currentUserId: string,
    provider: Provider,
    profile: ProviderProfile,
    invite?: string,
  ): Promise<string> {
    const account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: profile.id,
        },
      },
    });

    if (account) {
      // 前にこのアカウントでログインしたことがある：この端末の匿名メモを引き継ぐ
      await this.userService.merge(currentUserId, account.userId);
      return account.userId;
    }

    // 初めて見るアカウント: まだどことも繋いでいなければ(匿名・パスキーだけ)、そのまま紐づける
    // もうGoogleかXlllllll:whereをつないだユーザ(共有の端末など)なら別人かもしれないので、新しく作る
    const connected = await this.prisma.account.count({
      where: { userId: currentUserId },
    });
    const userId =
      connected > 0
        ? (await this.prisma.user.create({ data: {} })).id
        : currentUserId;

    // 招待コードがあれば、繋ぐ前に使う。使えなければ繋がずに、理由を付けて断る
    if (invite) {
      const failure = await this.invitationService.use(invite, userId);
      if (failure) throw new InvitationError(failure);
    }

    await this.prisma.account.create({
      data: {
        provider,
        providerAccountId: profile.id,
        email: profile.email,
        userId,
      },
    });
    return userId;
  }
}
