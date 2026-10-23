import type { AiProvider } from "./providers";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

// 断られた理由がわからないとき(つながらない、など)に見せる言葉
const FAILED = "うまく届かなかった。少し待って、もう一度話しかけてね";

// サーバが受け取れる長さ(backendのai.dto.tsと同じ数)
const MAX_DIARY = 8000;
const MAX_MESSAGES = 20;
export const MAX_CONTENT = 2000;

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
  // 長い会話は新しい方だけ送る。返事から始まると話の頭がわからないので、書いた人の言葉からにする
  const recent = messages.slice(-MAX_MESSAGES);
  if (recent[0].role === "assistant") recent.shift();
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      provider,
      // 長い日記と長い1通は、頭からサーバが受け取れるところまで
      diary: diary.slice(0, MAX_DIARY),
      messages: recent.map((m) => ({
        ...m,
        content: m.content.slice(0, MAX_CONTENT),
      })),
    }),
  }).catch(() => Response.error()); // つながらなかったら、失敗の返事として下で扱う
  if (!res.ok) {
    // 断られたら、サーバの言葉(「今日はここまで」など)をそのまま画面に出す
    const reason = await res.json().catch(() => ({}));
    throw new Error(
      typeof reason.message === "string" ? reason.message : FAILED,
    );
  }
  const body = (await res.json()) as { reply: string };
  return body.reply;
}
