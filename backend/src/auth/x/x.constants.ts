// 行きに預けて、帰りに照らし合わせるCookie
export const X_STATE_COOKIE = 'mosaku_x_state';
export const X_VERIFIER_COOKIE = 'mosaku_x_verifier';

// 登録するときに使う招待コード。行きに預けて、帰りに使う
export const X_INVITE_COOKIE = 'mosaku_x_invite';

// Xから戻ってくる先。行きと帰りで、同じURLをXに伝える
export function xRedirectUri(): string {
  return process.env.X_REDIRECT_URI ?? 'http://127.0.0.1:3000/auth/x/callback';
}
