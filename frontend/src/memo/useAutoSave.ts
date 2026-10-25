import { useEffect, useEffectEvent } from "react";

// 書き換えが止まって1.5秒たったら、自動で保存する。
// changes は、まだ保存していない書き換えの数
export function useAutoSave(
  changes: number,
  saving: boolean,
  save: () => void,
) {
  // タイマーが鳴ったときは、一番新しい save を呼ぶ
  const saveLatest = useEffectEvent(save);

  useEffect(() => {
    // 保存中は待つ。終わったら、その間に書いた分を保存し直す
    if (changes === 0 || saving) return;
    const timer = setTimeout(() => saveLatest(), 1500);
    // タブを閉じる・アプリを切り替えるなどで画面が隠れたら、待たずに保存する
    const saveNow = () => {
      if (document.visibilityState === "hidden") saveLatest();
    };
    document.addEventListener("visibilitychange", saveNow);
    // 1.5秒たつ前にまた書き換えたら、前のタイマーと見張りは捨てて数え直す
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", saveNow);
    };
  }, [changes, saving]);
}
