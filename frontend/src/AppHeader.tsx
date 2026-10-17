import { ThemeSwitch } from "./ThemeSwitch";
import { PasskeyRegister } from "./auth/PasskeyRegister";
import { GoogleLogin } from "./auth/GoogleLogin";
import { Menu } from "./Menu";
import type { Theme } from "./theme";

type Props = {
  query: string;
  theme: Theme;
  hasPasskey: boolean;
  hasGoogle: boolean;
  onQueryChange: (q: string) => void;
  onThemeChange: (theme: Theme) => void;
  onLogin: () => void;
  onRegistered: () => void;
  onLogout: () => void;
  onOpenList: () => void;
};

export function AppHeader({
  query,
  theme,
  hasPasskey,
  hasGoogle,
  onQueryChange,
  onThemeChange,
  onLogin,
  onRegistered,
  onLogout,
  onOpenList,
}: Props) {
  const registered = hasPasskey || hasGoogle;
  // 登録に使ったもの。例：Google・パスキー
  const ways = [hasGoogle && "Google", hasPasskey && "パスキー"]
    .filter(Boolean)
    .join("・");

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
        <PasskeyRegister
          hasPasskey={hasPasskey}
          canLogin={!registered}
          onLogin={onLogin}
          onRegistered={onRegistered}
        />
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
