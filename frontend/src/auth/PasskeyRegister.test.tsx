import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasskeyRegister } from "./PasskeyRegister";
import { registerPasskey } from "./passkeyApi";

// 本物はブラウザの生体認証を呼ぶので、テストでは「成功した」ことにする偽物に差し替える
vi.mock("./passkeyApi", () => ({
  registerPasskey: vi.fn().mockResolvedValue({}),
  loginWithPasskey: vi.fn().mockResolvedValue({}),
}));

const base = {
  hasPasskey: false,
  onLogin: () => {},
  onRegistered: () => {},
};

describe("PasskeyRegister", () => {
  it("未登録なら登録とログインのボタンを出す", () => {
    render(<PasskeyRegister {...base} />);

    expect(screen.getByText(/未登録/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "パスキーを登録" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "パスキーでログイン" }),
    ).toBeInTheDocument();
  });

  it("登録済みなら追加のボタンだけを出す", () => {
    render(<PasskeyRegister {...base} hasPasskey />);

    expect(screen.getByText("パスキー登録済み")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "パスキーを追加" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "パスキーでログイン" }),
    ).not.toBeInTheDocument();
  });

  it("登録に成功したらonRegisteredを呼ぶ", async () => {
    const onRegistered = vi.fn();
    render(<PasskeyRegister {...base} onRegistered={onRegistered} />);

    await userEvent.click(
      screen.getByRole("button", { name: "パスキーを登録" }),
    );

    // 登録は非同期なので、完了の表示が出るまで待つ
    expect(
      await screen.findByText("パスキーを登録しました"),
    ).toBeInTheDocument();
    expect(onRegistered).toHaveBeenCalled();
  });

  it("OSの確認をキャンセルしたら、キャンセルしたと出す", async () => {
    vi.mocked(registerPasskey).mockRejectedValueOnce(
      Object.assign(new Error("英語の説明"), { name: "NotAllowedError" }),
    );
    render(<PasskeyRegister {...base} />);

    await userEvent.click(
      screen.getByRole("button", { name: "パスキーを登録" }),
    );

    expect(await screen.findByText("キャンセルしました")).toBeInTheDocument();
  });
});
