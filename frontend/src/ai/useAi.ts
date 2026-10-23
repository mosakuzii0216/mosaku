import { useEffect, useState } from "react";
import { chatWithAi, fetchProviders, type ChatMessage } from "./aiApi";
import type { AiProvider } from "./providers";

// AIと話すための状態。選べるAIは、ページを開いた時に1回だけ、サーバから受け取る
export function useAi() {
  // 届くまではundefined。受け取れなかったら空にして、準備中と出す。
  const [providers, setProviders] = useState<AiProvider[]>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // 返事を待つ間はtrue。断られたら、その理由の言葉が入る
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProviders()
      .then(setProviders)
      .catch(() => setProviders([]));
  }, []);

  // 書いたことを会話に足して、日記と会話を全部送る。会話はサーバで覚えないので、毎回全部
  const send = async (provider: AiProvider, diary: string, text: string) => {
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setIsWaiting(true);
    setError("");
    try {
      const reply = await chatWithAi(provider, diary, next);
      // 待つ間に会話が最初からになっていたら(別の日記へ移ったら)、届いた返事は足さない
      setMessages((current) =>
        current === next
          ? [...next, { role: "assistant", content: reply }]
          : current,
      );
    } catch (e) {
      // 書いたことは会話に残す。続けて話しかければ、一緒に送り直せる
      setError((e as Error).message);
    } finally {
      // 返事が来ても、断られても、待つのはここまで
      setIsWaiting(false);
    }
  };

  // 別の日記に移ったら、会話を最初からにする。前の日記の話を持ち込まない。
  const reset = () => {
    setMessages([]);
    setError("");
  };

  return { providers, messages, isWaiting, error, send, reset };
}
