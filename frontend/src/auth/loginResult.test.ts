import { describe, it, expect, afterEach } from "vitest";
import { takeLoginFailed } from "./loginResult";

describe("takeLoginFailed", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("?login=failed で戻ってきたらtrueを返し、URLからは消す", () => {
    window.history.replaceState(null, "", "/?login=failed");

    expect(takeLoginFailed()).toBe(true);
    expect(window.location.search).toBe("");
  });

  it("2回目はもう消えているのでfalseを返す", () => {
    window.history.replaceState(null, "", "/?login=failed");
    takeLoginFailed();

    expect(takeLoginFailed()).toBe(false);
  });

  it("何もついていなければfalseを返す", () => {
    expect(takeLoginFailed()).toBe(false);
  });
});
