import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

// サーバが返した理由(日本語)を取り出す。読めなければ決まった文にする
export async function reasonOf(res: Response, fallback: string) {
  // 500はサーバの中の事故。理由は英語で、見せても役に立たない
  if (res.status >= 500) return fallback;
  try {
    const body: unknow = await res.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
    ) {
      return body.message;
    }
  } catch {
    // JSONでなかった
  }
  return fallback;
}
export async function registerPasskey(name: string) {
  // ① サーバからオプション(challenge入り)をもらう
  const optionsRes = await fetch(`${API_BASE}/auth/passkey/register/options`, {
    method: "POST",
    credentials: "include",
  });
  if (!optionsRes.ok) {
    throw new Error(
      await reasonOf(optionsRes, "パスキーの準備ができませんでした"),
    );
  }
  const optionsJSON = await optionsRes.json();

  // ② ブラウザがOSの生体認証を出す。ここでTouch IDや顔認証が走る
  const response = await startRegistration({ optionsJSON });

  // ③ サーバが検証して保存する
  const verifyRes = await fetch(`${API_BASE}/auth/passkey/register/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ response, name }),
  });
  if (!verifyRes.ok) {
    throw new Error(
      await reasonOf(verifyRes, "パスキーを確かめられませんでした"),
    );
  }
  return verifyRes.json();
}

export async function loginWithPasskey() {
  const optionsRes = await fetch(`${API_BASE}/auth/passkey/login/options`, {
    method: "POST",
    credentials: "include",
  });
  if (!optionsRes.ok) {
    throw new Error(
      await reasonOf(optionsRes, "パスキーの準備ができませんでした"),
    );
  }
  const optionsJSON = await optionsRes.json();

  const response = await startAuthentication({ optionsJSON });

  const verifyRes = await fetch(`${API_BASE}/auth/passkey/login/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ response }),
  });
  if (!verifyRes.ok) {
    throw new Error(
      await reasonOf(verifyRes, "パスキーを確かめられませんでした"),
    );
  }
  return verifyRes.json();
}
