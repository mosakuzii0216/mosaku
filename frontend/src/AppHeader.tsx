import { useEffect, useEffectEvent } from "react";
import { ThemeSwitch } from "./ThemeSwitch";
import { GoogleLogin } from "./auth/GoogleLogin";
import { Menu } from "./Menu";
import { MOD } from "./shortcut";
import type { Theme } from "./theme";

type Props = {
  query: string;
  theme: Theme;
  hasPasskey: boolean;
  hasGoogle: boolean;
  onQueryChange: (q: string) => void;
  onThemeChange: (theme: Theme) => void;
  onLogout: () => void;
  onOpenList: () => void;
  isAiOpen: boolean;
  onToggleAi: () => void;
};

export function AppHeader({
  query,
  theme,
  hasPasskey,
  hasGoogle,
  onQueryChange,
  onThemeChange,
  onLogout,
  onOpenList,
  isAiOpen,
  onToggleAi,
}: Props) {
  const registered = hasPasskey || hasGoogle;
  // 登録に使ったもの。例：Google・パスキー
  const ways = [hasGoogle && "Google", hasPasskey && "パスキー"]
    .filter(Boolean)
    .join("・");

  // ⌘J(WindownsはCtrl+J)で、どこからでもAIの席を開け閉めする
  // キーが押されたときは、一番新しいonToggleAiを呼ぶ
  const toggleAi = useEffectEvent(onToggleAi);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleAi();
      }
    };
    document.addEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="app-head">
      {/* 見た目は設定のボタンとそろえる */}
      <button className="menu-trigger" onClick={onOpenList}>
        一覧
      </button>
      <input
        className="search-input"
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="検索"
      />
      {/* 開いているあいだは、設定と同じく色を変える */}
      <button
        className="menu-trigger ai-toggle"
        aria-expanded={isAiOpen}
        onClick={onToggleAi}
      >
        AI
        {/* マウスを乗せたら、キーでも開けることを見せる */}
        <kbd className="ai-shortcut" aria-hidden="true">
          {MOD} J
        </kbd>
      </button>
      <Menu label="設定">
        <p className="menu-label">テーマ</p>
        <ThemeSwitch theme={theme} onChange={onThemeChange} />
        <p className="menu-label">アカウント</p>
        <div className="account-head">
          <p className="account-state">
            {registered
              ? `登録済み：${ways}`
              : "未登録：今はこの端末からしか開けません"}
          </p>
          {!registered && (
            <p className="account-note">
              登録すると、他の端末でも同じメモを開けます
            </p>
          )}
        </div>
        {/* Googleがまだなら出す。パスキーだけで登録した人も、ここからGoogleでつなげる */}
        {!hasGoogle && <GoogleLogin />}
        {/* 匿名のまま押すとメモに二度と戻れないので、登録済みのときだけ出す */}
        {registered && (
          <button className="ghost-button logout-button" onClick={onLogout}>
            ログアウト
          </button>
        )}
      </Menu>
    </header>
  );
}
