import type { Response } from 'express';

// 名札のCookie。匿名の人も登録した人も、これで見分ける
export const USER_COOKIE = 'mosaku_uid';

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// 本番はmosaku.jp全体に名札を付けて、画面(mosaku.jp)からもAPI(api.mosaku.jp)からも同じ名札が見えるようにする
function cookieDomain(): string | undefined {
  return process.env.COOKIE_DOMAIN || undefined;
}

// 名札を付ける。付け直すと、期限がまた1年後まで延びる
export function setUserCookie(res: Response, userId: string): void {
  const domain = cookieDomain();
  // api.mosaku.jpだけに付けた前の名札が残ると、名札が2枚になるので先に消す
  if (domain) res.clearCookie(USER_COOKIE, { path: '/' });
  res.cookie(USER_COOKIE, userId, {
    httpOnly: true,
    signed: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: ONE_YEAR_MS,
    path: '/',
    domain,
  });
}

// 名札を消す。次のアクセスは、新しい匿名の人になる
export function clearUserCookie(res: Response): void {
  const options = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
  res.clearCookie(USER_COOKIE, options);
  // mosaku.jp全体に付けた名札も消す
  const domain = cookieDomain();
  if (domain) res.clearCookie(USER_COOKIE, { ...options, domain });
}
