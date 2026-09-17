import { Injectable } from '@nestjs/common';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import type { AuthenticatorTransport } from '@simplewebauthn/server';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PasskeyService {
  constructor(private readonly prisma: PrismaService) {}

  // rpID はページのドメイン。api.mosaku.jpではなくmosaku.jp
  get rpID() {
    return process.env.RP_ID ?? 'localhost';
  }

  async buildRegistrationOptions(userId: string) {
    const existing = await this.prisma.passkey.findMany({
      where: { userId },
      select: { id: true, transports: true },
    });

    return generateRegistrationOptions({
      rpName: 'mosaku',
      rpID: this.rpID,
      userID: new TextEncoder().encode(userId),
      userName: userId, // メアドが無いのでidをそのまま使う
      userDisplayName: 'mosaku',
      attestationType: 'none',
      // 同じ端末に二重登録させない
      excludeCredentials: existing.map((p) => ({
        id: p.id,
        transports: p.transports as AuthenticatorTransport[],
      })),
      authenticatorSelection: {
        residentKey: 'required', // ユーザ名を打たずにログインできる形
        userVerification: 'preferred',
      },
    });
  }
}
