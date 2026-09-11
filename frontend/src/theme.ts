export const THEMES = ["system", "light", "dark", "mori"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
  system: "OSに従う",
  light: "ライト",
  dark: "ダーク",
  mori: "森",
};

const STORAGE_KEY = "mosaku-theme";

export function readTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY);
  return THEMES.includes(saved as Theme) ? (saved as Theme) : "system";
}

export function applyTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}
