import { describe, it, expect, beforeEach } from "vitest";
import { readTheme } from "./theme";

describe("readTheme", () => {
  beforeEach(() => localStorage.clear());

  it("保存が無ければsystemを返す", () => {
    expect(readTheme()).toBe("system");
  });

  it("壊れた値が入っていてもsystemに落とす", () => {
    localStorage.setItem("mosaku-theme", "森");
    expect(readTheme()).toBe("system");
  });
});
