import { useCallback, useEffect, useState } from "react";
import { fetchMe } from "./meApi";

export function useMe() {
  const [hasPasskey, setHasPasskey] = useState(false);
  const [hasGoogle, setHasGoogle] = useState(false);

  const reload = useCallback(async () => {
    try {
      const me = await fetchMe();
      setHasPasskey(me.hasPasskey);
      setHasGoogle(me.hasGoogle);
    } catch {
      // 取れなくてもメモは使えるので、未登録の表示のままにする
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { hasPasskey, hasGoogle, reload };
}
