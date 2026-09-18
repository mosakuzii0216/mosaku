import { BadRequestException, Injectable } from '@nestjs/common';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  AuthenticatorTransport,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server';
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

  // 検証に使う「ページのURL」。rpIDと違いスキームとポートまで含む
  get origin() {
    return process.env.RP_ORIGIN ?? 'http://localhost:5173';
  }

  async verifyRegistration(
    userId: string,
    response: RegistrationResponseJSON,
    expectedChallenge: string,
    name?: string,
  ) {
    const result = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
    });

    if (!result.verified) {
      throw new BadRequestException('パスキーの検証に失敗しました');
    }

    const { credential } = result.registrationInfo;

    return this.prisma.passkey.create({
      data: {
        id: credential.id,
        userId,
        publicKey: Buffer.from(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports ?? [],
        name,
      },
    });
  }

  async buildAuthenticationOptions() {
    // allowCredentials を渡さない = 「どのパスキーでもいい」
    // residentKey: 'required'で登録したので、ブラウザが候補を出してくれる
    return generateAuthenticationOptions({
      rpID: this.rpID,
      userVerification: 'preferred',
    });
  }

  async verifyAuthentication(
    response: AuthenticationResponseJSON,
    expectedChallenge: string,
  ): Promise<string> {
    const passkey = await this.prisma.passkey.findUnique({
      where: { id: response.id },
    });
    if (!passkey) {
      throw new BadRequestException('登録されていないパスキーです');
    }

    const result = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      credential: {
        id: passkey.id,
        publicKey: passkey.publicKey,
        counter: passkey.counter,
        transports: passkey.transports as AuthenticatorTransport[],
      },
    });

    if (!result.verified) {
      throw new BadRequestException('パスキーの認証に失敗しました');
    }

    await this.prisma.passkey.update({
      where: { id: passkey.id },
      data: {
        counter: result.authenticationInfo.newCounter,
        lastUsedAt: new Date(),
      },
    });
    return passkey.userId;
  }
}
