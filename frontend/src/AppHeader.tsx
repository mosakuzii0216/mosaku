import { ThemeSwitch } from "./ThemeSwitch";
import { PasskeyRegister } from "./auth/PasskeyRegister";
import { Menu } from "./Menu";
import type { Theme } from "./theme";

type Props = {
  query: string;
  theme: Theme;
  hasPasskey: boolean;
  onQueryChange: (q: string) => void;
  onThemeChange: (theme: Theme) => void;
  onLogin: () => void;
  onRegistered: () => void;
};

export function AppHeader({
  query,
  theme,
  hasPasskey,
  onQueryChange,
  onThemeChange,
  onLogin,
  onRegistered,
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
        <PasskeyRegister
          hasPasskey={hasPasskey}
          onLogin={onLogin}
          onRegistered={onRegistered}
        />
      </Menu>
    </header>
  );
}
