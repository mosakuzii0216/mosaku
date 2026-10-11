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

  it("OSに使うを選んだ人はsystemのまま", () => {
    localStorage.setItem("mosaku-theme", "system");
    expect(readTheme()).toBe("system");
  });
});
