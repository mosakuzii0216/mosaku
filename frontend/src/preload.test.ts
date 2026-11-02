import { describe, it, expect, beforeEach } from "vitest";
import html from "../index.html?raw";
import { THEMES, applyTheme, readTheme } from "./theme";

// index.htmlの先読み(Reactより先に走る、1つ目のscript)を取り出す
const preload = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";

const color = () =>
  document.querySelector('meta[name="theme-color"]')?.getAttribute("content");

describe("index.htmlの先読み", () => {
  beforeEach(() => {
    localStorage.clear();
    document.head.innerHTML = '<meta name="theme-color" content="">';
  });

  // 先読みは打ち間違えても黙って動くので、applyThemeと同じ結果になるかで見張る
  it.each(THEMES)("%sを選んでいたら、applyThemeと同じ色で聞く", (theme) => {
    applyTheme(theme);
    const expected = color();

    document.documentElement.removeAttribute("data-theme");
    document.head.innerHTML = '<meta name="theme-color" content="">';
    new Function(preload)();

    expect(document.documentElement.getAttribute("data-theme")).toBe(theme);
    expect(color()).toBe(expected);
  });

  it("保存が無ければ、readThemeと同じテーマで開く", () => {
    new Function(preload)();

    const theme = document.documentElement.getAttribute("data-theme");
    expect(theme).toBe(readTheme());
  });
});
