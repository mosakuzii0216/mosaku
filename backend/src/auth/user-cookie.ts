import type { Response } from 'express';

// 名札のCookie。匿名の人も登録した人も、これで見分ける
export const USER_COOKIE = 'mosaku_uid';

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// 名札を付ける。付け直すと、期限がまた1年後まで延びる
export function setUserCookie(res: Response, userId: string): void {
  res.cookie(USER_COOKIE, userId, {
    httpOnly: true,
    signed: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: ONE_YEAR_MS,
    path: '/',
  });
}

// 名札を消す。次のアクセスは、新しい匿名の人になる
export function clearUserCookie(res: Response): void {
  res.clearCookie(USER_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}
