import {
  Controller,
  Get,
  Inject,
  Logger,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';
import { CodeChallengeMethod, OAuth2Client } from 'google-auth-library';
import {
  GOOGLE_OAUTH_CLIENT,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
} from './google.constants';
import { GoogleAccountService, GoogleProfile } from './google-account.service';
import { CurrentUser } from '../current-user.decorator';
import { USER_COOKIE } from '../anonymous-user.middleware';
import type { User } from '../../../generated/prisma/client';

const TEN_MINUTES_MS = 10 * 60 * 1000;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

@Controller('auth/google')
export class GoogleController {
  private readonly logger = new Logger(GoogleController.name);

  constructor(
    @Inject(GOOGLE_OAUTH_CLIENT) private readonly client: OAuth2Client,
    private readonly googleAccountService: GoogleAccountService,
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

  // 図の⑥〜⑪：合言葉を照らし合わせ、証明書をもらって確かめ、名札を渡して画面へ戻す
  @Get('callback')
  async callback(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
  ) {
    const frontend = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const savedState: unknown = req.signedCookies?.[GOOGLE_STATE_COOKIE];
    const verifier: unknown = req.signedCookies?.[GOOGLE_VERIFIER_COOKIE];

    // 使い捨て。うまくいってもいかなくても、二度は使わせない
    res.clearCookie(GOOGLE_STATE_COOKIE, { path: '/auth/google' });
    res.clearCookie(GOOGLE_VERIFIER_COOKIE, { path: '/auth/google' });

    // ⑦ 自分が始めたログインか確かめる。違えばGoogleには問い合わせずに戻す
    if (
      !code ||
      typeof savedState !== 'string' ||
      typeof verifier !== 'string' ||
      state !== savedState
    ) {
      return res.redirect(`${frontend}/?login=failed`);
    }

    let profile: GoogleProfile;
    try {
      // ⑧ 引換券と鍵を出して、証明書(id_token)をもらう
      const { tokens } = await this.client.getToken({
        code,
        codeVerifier: verifier,
      });
      // ⑨ Googleの署名と、mosaku宛ての証明書か(audience)を確かめる
      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token ?? '',
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload?.sub) throw new Error('証明書にsubがありません');
      profile = { sub: payload.sub, email: payload.email };
    } catch (e) {
      this.logger.warn(`Googleログインの確認に失敗しました: ${String(e)}`);
      return res.redirect(`${frontend}/?login=failed`);
    }

    // ⑩ mosakuのユーザーにつなぐ
    const userId = await this.googleAccountService.login(user.id, profile);

    // ⑪ つないだユーザーの名札を渡して、画面へ戻す
    res.cookie(USER_COOKIE, userId, {
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ONE_YEAR_MS,
      path: '/',
    });
    res.redirect(frontend);
  }
}
