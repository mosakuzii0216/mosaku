import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

export async function registerPasskey(name: string) {
  // ① サーバからオプション(challenge入り)をもらう
  const optionsRes = await fetch(`${API_BASE}/auth/passkey/register/options`, {
    method: "POST",
    credentials: "include",
  });
  if (!optionsRes.ok) throw new Error(`options failed: ${optionsRes.status}`);
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
  if (!verifyRes.ok) throw new Error(`verify failed: ${verifyRes.status}`);
  return verifyRes.json();
}

export async function loginWithPasskey() {
  const optionsRes = await fetch(`${API_BASE}/auth/passkey/login/options`, {
    method: "POST",
    credentials: "include",
  });
  if (!optionsRes.ok) throw new Error(`options failed: ${optionsRes.status}`);
  const optionsJSON = await optionsRes.json();

  const response = await startAuthentication({ optionsJSON });

  const verifyRes = await fetch(`${API_BASE}/auth/passkey/login/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ response }),
  });
  if (!verifyRes.ok) throw new Error(`verify failed: ${verifyRes.status}`);
  return verifyRes.json();
}
