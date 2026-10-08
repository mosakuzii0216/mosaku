import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppHeader } from "./AppHeader";

const base = {
  query: "",
  theme: "system" as const,
  hasPasskey: false,
  hasGoogle: false,
  onQueryChange: () => {},
  onThemeChange: () => {},
  onLogin: () => {},
  onRegistered: () => {},
  onLogout: () => {},
};

describe("AppHeader", () => {
  it("検索欄に打つとonQueryChangeが呼ばれる", async () => {
    const onQueryChange = vi.fn();
    render(<AppHeader {...base} onQueryChange={onQueryChange} />);

    await userEvent.type(screen.getByRole("searchbox"), "森");

    expect(onQueryChange).toHaveBeenCalledWith("森");
  });

  it("テーマのメニューを開くとテーマのボタンが出る", async () => {
    render(<AppHeader {...base} />);

    await userEvent.click(screen.getByRole("button", { name: "テーマ" }));

    expect(screen.getByRole("button", { name: "森" })).toBeInTheDocument();
  });

  it("アカウントのメニューを開くとパスキーのボタンが出る", async () => {
    render(<AppHeader {...base} />);

    await userEvent.click(screen.getByRole("button", { name: "アカウント" }));

    expect(
      screen.getByRole("button", { name: "パスキーでログイン" }),
    ).toBeInTheDocument();
  });

  it("アカウントのメニューを開くとGoogleで続けるが出る", async () => {
    render(<AppHeader {...base} />);

    await userEvent.click(screen.getByRole("button", { name: "アカウント" }));

    expect(
      screen.getByRole("link", { name: "Googleで続ける" }),
    ).toBeInTheDocument();
  });

  it("未登録なら、ログアウトは出さない", async () => {
    render(<AppHeader {...base} />);

    await userEvent.click(screen.getByRole("button", { name: "アカウント" }));

    expect(
      screen.queryByRole("button", { name: "ログアウト" }),
    ).not.toBeInTheDocument();
  });

  it("登録済みならログアウトが出て、押すとonLogoutが呼ばれる", async () => {
    const onLogout = vi.fn();
    render(<AppHeader {...base} hasGoogle onLogout={onLogout} />);

    await userEvent.click(screen.getByRole("button", { name: "アカウント" }));
    await userEvent.click(screen.getByRole("button", { name: "ログアウト" }));

    expect(onLogout).toHaveBeenCalled();
  });
});
