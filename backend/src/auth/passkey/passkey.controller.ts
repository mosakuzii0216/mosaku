import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PasskeyService } from './passkey.service';
import { CurrentUser } from '../current-user.decorator';
import type { User } from '../../../generated/prisma/client';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { UserService } from 'src/user/user.service';
import { USER_COOKIE } from '../anonymous-user.middleware';

export const CHALLENGE_COOKIE = 'mosaku_challenge';
const FIVE_MINUTES_MS = 5 * 60 * 1000;

@Controller('auth/passkey')
export class PasskeyController {
  constructor(
    private readonly passkeyService: PasskeyService,
    private readonly userService: UserService,
  ) {}

  @Post('register/options')
  async registerOptions(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const options = await this.passkeyService.buildRegistrationOptions(user.id);

    // 検証時に「さっき出した値か」を確かめるために預ける
    res.cookie(CHALLENGE_COOKIE, options.challenge, {
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: FIVE_MINUTES_MS,
      path: '/',
    });

    return options;
  }

  @Post('register/verify')
  async registerVerify(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { response: RegistrationResponseJSON; name?: string },
  ) {
    const challenge = req.signedCookies?.[CHALLENGE_COOKIE];
    if (typeof challenge !== 'string') {
      throw new BadRequestException('challengeがありません');
    }

    const passkey = await this.passkeyService.verifyRegistration(
      user.id,
      body.response,
      challenge,
      body.name,
    );

    // 使い捨て。成否にかかわらず二度使わせない。
    res.clearCookie(CHALLENGE_COOKIE, { path: '/' });

    return { id: passkey.id, name: passkey.name, createdAt: passkey.createdAt };
  }

  @Post('login/options')
  async loginOptions(@Res({ passthrough: true }) res: Response) {
    const options = await this.passkeyService.buildAuthenticationOptions();

    res.cookie(CHALLENGE_COOKIE, options.challenge, {
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: FIVE_MINUTES_MS,
      path: '/',
    });

    return options;
  }

  @Post('login/verify')
  async loginVerify(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { response: AuthenticationResponseJSON },
  ) {
    const challenge = req.signedCookies?.[CHALLENGE_COOKIE];
    if (typeof challenge !== 'string') {
      throw new BadRequestException('challengeがありません');
    }

    const ownerId = await this.passkeyService.verifyAuthentication(
      body.response,
      challenge,
    );

    // このデバイスで書いていた匿名メモを引き継ぐ
    await this.userService.merge(user.id, ownerId);

    // 以後このブラウザは本登録ユーザとして振る舞う
    res.cookie(USER_COOKIE, ownerId, {
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 365 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.clearCookie(CHALLENGE_COOKIE, { path: '/' });

    return { userId: ownerId };
  }
}
