import { Controller, Get, Logger, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createHash, randomBytes } from 'node:crypto';
import {
  X_INVITE_COOKIE,
  X_STATE_COOKIE,
  X_VERIFIER_COOKIE,
  xRedirectUri,
} from './x.constants';
import { CurrentUser } from '../current-user.decorator';
import { USER_COOKIE } from '../anonymous-user.middleware';
import { XClient } from './x.client';
import { AccountService } from '../account/account.service';
import type { User } from '../../../generated/prisma/client';
import { InvitationError } from '../../invitation/invitation.service';

const TEN_MINUTES_MS = 10 * 60 * 1000;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

@Controller('auth/x')
export class XController {
  private readonly logger = new Logger(XController.name);
  constructor(
    private readonly client: XClient,
    private readonly accountService: AccountService,
  ) {}
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

  // Xから戻ってきたら、合言葉を照らし合わせ、Xの人をmosakuのユーザにつないで名札を渡す
  @Get('callback')
  async callback(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
  ) {
    const frontend = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const savedState: unknown = req.signedCookies?.[X_STATE_COOKIE];
    const verifier: unknown = req.signedCookies?.[X_VERIFIER_COOKIE];
    const invite: unknown = req.signedCookies?.[X_INVITE_COOKIE];

    // 使い捨て。うまくいってもいかなくても、二度は使わせない
    res.clearCookie(X_STATE_COOKIE, { path: '/auth/x' });
    res.clearCookie(X_VERIFIER_COOKIE, { path: '/auth/x' });
    res.clearCookie(X_INVITE_COOKIE, { path: '/auth/x' });

    // 自分が始めたログインか確かめる。違えばXには問い合わせずに戻す
    if (
      !code ||
      typeof savedState !== 'string' ||
      typeof verifier !== 'string' ||
      state !== savedState
    ) {
      return res.redirect(`${frontend}/?login=failed`);
    }

    // 引換券と鍵を出して、Xの人のIDを読む。Xに断られたら、つながずに戻す
    let xUserId: string;
    try {
      xUserId = await this.client.fetchUserId(code, verifier);
    } catch (e) {
      this.logger.warn(`Xログインの確認に失敗しました: ${String(e)}`);
      return res.redirect(`${frontend}/?login=failed`);
    }
    // Xの人を、mosakuのユーザにつなぐ。初めてのXなら、預かった招待コードを使う
    let userId: string;
    try {
      userId = await this.accountService.login(
        user.id,
        'x',
        { id: xUserId },
        typeof invite === 'string' ? invite : undefined,
      );
    } catch (e) {
      // 招待コードを使えなければ、登録せずに理由を付けて画面へ戻す
      if (!(e instanceof InvitationError)) throw e;
      return res.redirect(`${frontend}/?invite=${e.reason}`);
    }

    // つないだユーザの名札を渡して、画面へ戻す
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
