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
}: Props) {
  return (
    <header className="app-head">
      <input
        className="search-input"
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="検索"
      />
      <Menu label="テーマ">
        <ThemeSwitch theme={theme} onChange={onThemeChange} />
      </Menu>
      <Menu label="アカウント">
        <GoogleLogin linked={hasGoogle} />
        <PasskeyRegister
          hasPasskey={hasPasskey}
          onLogin={onLogin}
          onRegistered={onRegistered}
        />
        {/* 匿名のまま押すとメモに二度と戻れないので、登録済みのときだけ出す */}
        {(hasPasskey || hasGoogle) && (
          <button className="ghost-button logout-button" onClick={onLogout}>
            ログアウト
          </button>
        )}
      </Menu>
    </header>
  );
}
