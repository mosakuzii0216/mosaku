import { THEMES, THEME_LABELS, type Theme } from "./theme";

type Props = {
  theme: Theme;
  onChange: (theme: Theme) => void;
};

export function ThemeSwitch({ theme, onChange }: Props) {
  return (
    <div className="theme-switch">
      {THEMES.map((t) => (
        <button
          key={t}
          className={t === theme ? "is-active" : ""}
          onClick={() => onChange(t)}
        >
          {THEME_LABELS[t]}
        </button>
      ))}
    </div>
  );
}
