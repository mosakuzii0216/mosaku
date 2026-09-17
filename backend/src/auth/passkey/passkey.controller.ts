import { Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PasskeyService } from './passkey.service';
import { CurrentUser } from '../current-user.decorator';
import type { User } from '../../../generated/prisma/client';

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
}
