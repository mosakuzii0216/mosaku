import { useEffect, useState } from "react";
import { readTheme, applyTheme, type Theme } from "./theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return [theme, setTheme] as const;
}
