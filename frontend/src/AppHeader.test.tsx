import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppHeader } from "./AppHeader";

const base = {
  query: "",
  theme: "yoru" as const,
  hasPasskey: false,
  hasGoogle: false,
  onQueryChange: () => {},
  onThemeChange: () => {},
  onLogin: () => {},
  onRegistered: () => {},
  onLogout: () => {},
  onOpenList: () => {},
};

describe("AppHeader", () => {
  it("検索欄に打つとonQueryChangeが呼ばれる", async () => {
    const onQueryChange = vi.fn();
    render(<AppHeader {...base} onQueryChange={onQueryChange} />);

    await userEvent.type(screen.getByRole("searchbox"), "森");

    expect(onQueryChange).toHaveBeenCalledWith("森");
  });

  it("一覧を押すとonOpenListが呼ばれる", async () => {
    const onOpenList = vi.fn();
    render(<AppHeader {...base} onOpenList={onOpenList} />);

    await userEvent.click(screen.getByRole("button", { name: "一覧" }));

    expect(onOpenList).toHaveBeenCalled();
  });

  it("設定を開くとテーマのボタンが出る", async () => {
    render(<AppHeader {...base} />);

    await userEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(screen.getByRole("button", { name: "森" })).toBeInTheDocument();
  });

  it("設定を開くとパスキーのボタンが出る", async () => {
    render(<AppHeader {...base} />);

    await userEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(
      screen.getByRole("button", { name: "パスキーでログイン" }),
    ).toBeInTheDocument();
  });

  it("設定を開くとGoogleで続けるが出る", async () => {
    render(<AppHeader {...base} />);

    await userEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(
      screen.getByRole("link", { name: "Googleで続ける" }),
    ).toBeInTheDocument();
  });

  it("未登録なら、今の状態と、登録とログインの入り口を出す", async () => {
    render(<AppHeader {...base} />);

    await userEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(
      screen.getByText("未登録：今はこの端末からしか開けません"),
    ).toBeInTheDocument();
    expect(screen.getByText("すでに登録している方")).toBeInTheDocument();
  });

  it("登録済みなら、使ったものを出して、Googleとログインの入り口は出さない", async () => {
    render(<AppHeader {...base} hasGoogle hasPasskey />);

    await userEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(screen.getByText("登録済み：Google・パスキー")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Googleで続ける" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "パスキーでログイン" }),
    ).not.toBeInTheDocument();
  });

  // 前にパスキーだけで登録した人も、Googleをあとからつなげる
  it("パスキーだけで登録済みなら、Googleで続けるが出る", async () => {
    render(<AppHeader {...base} hasPasskey />);

    await userEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(
      screen.getByRole("link", { name: "Googleで続ける" }),
    ).toBeInTheDocument();
  });

  it("未登録なら、ログアウトは出さない", async () => {
    render(<AppHeader {...base} />);

    await userEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(
      screen.queryByRole("button", { name: "ログアウト" }),
    ).not.toBeInTheDocument();
  });

  it("登録済みならログアウトが出て、押すとonLogoutが呼ばれる", async () => {
    const onLogout = vi.fn();
    render(<AppHeader {...base} hasGoogle onLogout={onLogout} />);

    await userEvent.click(screen.getByRole("button", { name: "設定" }));
    await userEvent.click(screen.getByRole("button", { name: "ログアウト" }));

    expect(onLogout).toHaveBeenCalled();
  });
});
