const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

// 画面を描くたびに1回だけ呼ぶ。匿名IDのCookieを先に受け取っておけば、
// そのあと同時に飛ぶリクエストが全部同じCookieを持っていける
export async function ensureSession(): Promise<void> {
  try {
    await fetch(`${API_BASE}/me`, {
      credentials: "include",
      // 返事が来なくても、5秒で諦めて画面を出す
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    //失敗しても画面が出す。そのあとのリクエストが自分dねCookieを受け取る
  }
}
