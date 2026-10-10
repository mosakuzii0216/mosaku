import { describe, it, expect } from "vitest";
import { passkeyErrorMessage } from "./passkeyError";

// ブラウザのエラーは name で種類がわかるので、name 付きのエラーを作る
const errorNamed = (name: string) =>
  Object.assign(new Error("英語の説明"), { name });

describe("passkeyErrorMessage", () => {
  it("OSの確認をキャンセルしたら、キャンセルしたと出す", () => {
    expect(passkeyErrorMessage(errorNamed("NotAllowedError"))).toBe(
      "キャンセルしました",
    );
  });
  it("このパン松のパスキーがもう登録済みなら、そう出す", () => {
    expect(passkeyErrorMessage(errorNamed("InvalidStateError"))).toBe(
      "この端末のパスキーは既に登録されています",
    );
  });
  it("通信できなかったら、通信できなかったと出す", () => {
    expect(passkeyErrorMessage(new TypeError("Failed to fetch"))).toBe(
      "通信できませんでした",
    );
  });
  it("サーバが返した理由は、そのまま出す", () => {
    expect(passkeyErrorMessage(new Error("登録されていないパスキーです"))).toBe(
      "登録されていないパスキーです",
    );
  });
});
