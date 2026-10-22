import { useEffect, useState } from "react";
import { chatWithAi, fetchProviders, type ChatMessage } from "./aiApi";
import type { AiProvider } from "./providers";

// AIと話すための状態。選べるAIは、ページを開いた時に1回だけ、サーバから受け取る
export function useAi() {
  // 届くまではundefined。受け取れなかったら空にして、準備中と出す。
  const [providers, setProviders] = useState<AiProvider[]>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    fetchProviders()
      .then(setProviders)
      .catch(() => setProviders([]));
  }, []);

  // 書いたことを会話に足して、日記と会話を全部送る。会話はサーバで覚えないので、毎回全部
  const send = async (provider: AiProvider, diary: string, text: string) => {
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    // TODO: 返事を待つ間と、断られたときの見せ方
    const reply = await chatWithAi(provider, diary, next);
    setMessages([...next, { role: "assistant", content: reply }]);
  };

  return { providers, messages, send };
}
