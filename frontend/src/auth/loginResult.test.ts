import { describe, it, expect, afterEach } from "vitest";
import { takeInviteFailure, takeLoginFailed } from "./loginResult";

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

describe("takeInviteFailure", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("?invite=used で戻ってきたら理由を返し、URLからは消す", () => {
    window.history.replaceState(null, "", "/?invite=used");

    expect(takeInviteFailure()).toBe("used");
    expect(window.location.search).toBe("");
  });

  it("何もついていなければnullを返す", () => {
    expect(takeInviteFailure()).toBeNull();
  });
});
