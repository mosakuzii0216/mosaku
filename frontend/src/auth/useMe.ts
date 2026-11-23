import { useCallback, useEffect, useState } from "react";
import { fetchMe } from "./meApi";

export function useMe() {
  const [hasPasskey, setHasPasskey] = useState(false);
  const [hasGoogle, setHasGoogle] = useState(false);
  const [hasX, setHasX] = useState(false);
  // 招待で登録した人と開発者。招待コードを作れる
  const [isPremium, setIsPremium] = useState(false);

  const reload = useCallback(async () => {
    try {
      const me = await fetchMe();
      setHasPasskey(me.hasPasskey);
      setHasGoogle(me.hasGoogle);
      setHasX(me.hasX);
      setIsPremium(me.isPremium);
    } catch {
      // 取れなくてもメモは使えるので、未登録の表示のままにする
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { hasPasskey, hasGoogle, hasX, isPremium, reload };
}
