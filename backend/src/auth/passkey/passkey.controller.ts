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
import type { RegistrationResponseJSON } from '@simplewebauthn/server';

export const CHALLENGE_COOKIE = 'mosaku_challenge';
const FIVE_MINUTES_MS = 5 * 60 * 1000;

@Controller('auth/passkey')
export class PasskeyController {
  constructor(private readonly passkeyService: PasskeyService) {}

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
}
