// 夜・森・ライトの3つ。ダークは夜と被り、OSに従うはほぼ使われないので外した
export const THEMES = ["yoru", "mori", "light"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
  yoru: "夜",
  mori: "森",
  light: "ライト",
};

const STORAGE_KEY = "mosaku-theme";
// 初めて開いた人は夜の書斎から。index.htmlの先読みも同じ値にそろえる
const DEFAULT_THEME: Theme = "yoru";

export function readTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY);
  return THEMES.includes(saved as Theme) ? (saved as Theme) : DEFAULT_THEME;
}

export function applyTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}
