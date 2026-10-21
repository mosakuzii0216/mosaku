import { useEffect, useState } from "react";
import { fetchProviders } from "./aiApi";
import type { AiProvider } from "./providers";

// AIと話すための状態。選べるAIは、ページを開いた時に1回だけ、サーバから受け取る
export function useAi() {
  // 届くまではundefined。受け取れなかったら空にして、準備中と出す。
  const [providers, setProviders] = useState<AiProvider[]>();

  useEffect(() => {
    fetchProviders()
      .then(setProviders)
      .catch(() => setProviders([]));
  }, []);

  return { providers };
}
