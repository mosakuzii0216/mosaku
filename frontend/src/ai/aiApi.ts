import type { AiProvider } from "./providers";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

//会話の1通。user=日記を書いた人、assistant=AI
export type ChatMessage = { role: "user" | "assistant"; content: string };

// 選べるAIの名前。サーバの.envに書いた順に届く。誰でも見られるのでCookieは送らない
export async function fetchProviders(): Promise<AiProvider[]> {
  const res = await fetch(`${API_BASE}/ai/providers`);
  if (!res.ok) throw new Error(`providers failed: ${res.status}`);
  const body = (await res.json()) as { providers: AiProvider[] };
  return body.providers;
}

// 開いている日記と、ここまでの会話を送って、AIの返事を受け取る。Googleのログインが要るのでCookieも送る
export async function chatWithAi(
  provider: AiProvider,
  diary: string,
  messages: ChatMessage[],
): Promise<string> {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ provider, diary, messages }),
  });
  if (!res.ok) throw new Error(`chat failed: ${res.status}`);
  const body = (await res.json()) as { reply: string };
  return body.reply;
}
