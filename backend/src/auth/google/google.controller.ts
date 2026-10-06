import { Controller, Get, Inject, Res } from '@nestjs/common';
import type { Response } from 'express';
import { randomBytes } from 'node:crypto';
import { CodeChallengeMethod, OAuth2Client } from 'google-auth-library';
import {
  GOOGLE_OAUTH_CLIENT,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
} from './google.constants';

const TEN_MINUTES_MS = 10 * 60 * 1000;

@Controller('auth/google')
export class GoogleController {
  constructor(
    @Inject(GOOGLE_OAUTH_CLIENT) private readonly client: OAuth2Client,
  ) {}

  // 合言葉と鍵を作って預け、Googleのログイン画面へ送る
  @Get('start')
  async start(@Res() res: Response) {
    const state = randomBytes(16).toString('base64url');
    const { codeVerifier, codeChallenge } =
      await this.client.generateCodeVerifierAsync();

    // 帰りの /auth/google/callback でだけ使う、10分で消える使い捨てのCookie
    const options = {
      httpOnly: true,
      signed: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      maxAge: TEN_MINUTES_MS,
      path: '/auth/google',
    };
    res.cookie(GOOGLE_STATE_COOKIE, state, options);
    res.cookie(GOOGLE_VERIFIER_COOKIE, codeVerifier, options);

    const url = this.client.generateAuthUrl({
      scope: ['openid', 'email'],
      state,
      code_challenge_method: CodeChallengeMethod.S256,
      code_challenge: codeChallenge,
    });
    res.redirect(url);
  }
}
