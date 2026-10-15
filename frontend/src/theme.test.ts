import { describe, it, expect, beforeEach } from "vitest";
import { readTheme } from "./theme";

describe("readTheme", () => {
  beforeEach(() => localStorage.clear());

  it("保存が無ければyoruを返す", () => {
    expect(readTheme()).toBe("yoru");
  });

  it("壊れた値が入っていてもyoruに落とす", () => {
    localStorage.setItem("mosaku-theme", "森");
    expect(readTheme()).toBe("yoru");
  });

  it("前に選べたダークやOSに従うが残っていたら、夜に戻す", () => {
    localStorage.setItem("mosaku-theme", "dark");
    expect(readTheme()).toBe("yoru");

    localStorage.setItem("mosaku-theme", "system");
    expect(readTheme()).toBe("yoru");
  });
});
