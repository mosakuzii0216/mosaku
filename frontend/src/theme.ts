// 夜の書斎・霧の森・昼の縁側・暁の丘の4つ。ダークは夜と被り、OSに従うはほぼ使われないので外した
export const THEMES = ["yoru", "mori", "hiru", "asa"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
  mori: "霧の森",
  hiru: "昼の縁側",
  yoru: "夜の書斎",
  asa: "暁の丘",
};

// ブラウザの上の帯の色。index.cssでhtmlに塗る地の色と、index.htmlの先読みにそろえる
const THEME_COLORS: Record<Theme, string> = {
  yoru: "#141720",
  mori: "#1b322c",
  hiru: "#faf6ee",
  asa: "#1b1a30",
};

const STORAGE_KEY = "mosaku-theme";
// 初めて開いた人は夜の書斎から。index.htmlの先読みも同じ値にそろえる
const DEFAULT_THEME: Theme = "yoru";

export function readTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY);
  // 昼は前、lightという名前だった。その端末は、昼の縁側として読む
  if (saved === "light") return "hiru";
  return THEMES.includes(saved as Theme) ? (saved as Theme) : DEFAULT_THEME;
}

export function applyTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
}
