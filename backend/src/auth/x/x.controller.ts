import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { createHash, randomBytes } from 'node:crypto';
import {
  X_INVITE_COOKIE,
  X_STATE_COOKIE,
  X_VERIFIER_COOKIE,
  xRedirectUri,
} from './x.constants';

const TEN_MINUTES_MS = 10 * 60 * 1000;

@Controller('auth/x')
export class XController {
  // 合言葉と鍵を作って預け、Xのログイン画面へ送る
  @Get('start')
  start(@Res() res: Response, @Query('invite') invite?: string) {
    const state = randomBytes(16).toString('base64url');
    // PKCEの鍵と、そのハッシュ。Xには先にハッシュだけを見せて、帰りに鍵を出す
    const verifier = randomBytes(32).toString('base64url');
    const challenge = createHash('sha256').update(verifier).digest('base64url');

    // 帰りの /auth/x/callback でだけ使う、10分で消える使い捨てのCookie
    const options = {
      httpOnly: true,
      signed: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      maxAge: TEN_MINUTES_MS,
      path: '/auth/x',
    };
    res.cookie(X_STATE_COOKIE, state, options);
    res.cookie(X_VERIFIER_COOKIE, verifier, options);
    // 招待コードも、Xから戻るまでに預かる。なければ空にして、前の分を残さない
    res.cookie(X_INVITE_COOKIE, invite ?? '', options);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.X_CLIENT_ID ?? 'not-configured',
      redirect_uri: xRedirectUri(),
      // 自分のID(GET /2/users/me)を読むのに要る2つ
      scope: 'users.read tweet.read',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });
    res.redirect(`https://x.com/i/oauth2/authorize?${params.toString()}`);
  }
}
