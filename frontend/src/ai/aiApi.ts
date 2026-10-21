import type { AiProvider } from "./providers";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

// 選べるAIの名前。サーバの.envに書いた順に届く。誰でも見られるのでCookieは送らない
export async function fetchProviders(): Promise<AiProvider[]> {
  const res = await fetch(`${API_BASE}/ai/providers`);
  if (!res.ok) throw new Error(`providers failed: ${res.status}`);
  const body = (await res.json()) as { providers: AiProvider[] };
  return body.providers;
}
