import { describe, it, expect, beforeEach } from "vitest";
import { applyTheme, readTheme } from "./theme";

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

  it("前の名前のlightが残っていたら、昼の縁側として読む", () => {
    localStorage.setItem("mosaku-theme", "light");
    expect(readTheme()).toBe("hiru");
  });
});

describe("applyTheme", () => {
  it("ブラウザの上の帯の色を、テーマの地の色にする", () => {
    document.head.innerHTML = '<meta name="theme-color" content="#141720">';
    const color = () =>
      document
        .querySelector('meta[name="theme-color"]')
        ?.getAttribute("content");

    applyTheme("hiru");
    expect(color()).toBe("#faf6ee");

    applyTheme("mori");
    expect(color()).toBe("#0e1a17");
  });
});
