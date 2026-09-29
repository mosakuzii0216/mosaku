import { useCallback, useEffect, useState } from "react";
import { fetchMe } from "./meApi";

export function useMe() {
  const [hasPasskey, setHasPasskey] = useState(false);

  const reload = useCallback(async () => {
    try {
      const me = await fetchMe();
      setHasPasskey(me.hasPasskey);
    } catch {
      // 取れなくてもメモは使えるので、未登録の表示のままにする
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { hasPasskey, reload };
}
