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
  onLogout: () => {},
  onOpenList: () => {},
  isAiOpen: false,
  onToggleAi: () => {},
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

  it("AIを押すとonToggleAiが呼ばれる", async () => {
    const onToggleAi = vi.fn();
    render(<AppHeader {...base} onToggleAi={onToggleAi} />);

    await userEvent.click(screen.getByRole("button", { name: "AI" }));

    expect(onToggleAi).toHaveBeenCalled();
  });

  it("⌘J(WindowsはCtrl+J)でも、AIの席を開け閉めする", async () => {
    const onToggleAi = vi.fn();
    // npm run devと同じく、見張をつけて、外して、付け直す
    render(<AppHeader {...base} onToggleAi={onToggleAi} />, {
      reactStrictMode: true,
    });

    // Jだけなら、日記に書いている字なので何もしない
    await userEvent.keyboard("j");
    await userEvent.keyboard("{Meta>}j{/Meta}");
    await userEvent.keyboard("{Control>}j{/Control}");

    expect(onToggleAi).toHaveBeenCalledTimes(2);
  });

  it("設定を開くとテーマのボタンが出る", async () => {
    render(<AppHeader {...base} />);

    await userEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(screen.getByRole("button", { name: "森" })).toBeInTheDocument();
  });

  // 登録とログインはGoogleだけにしたので、パスキーのボタンは出さない
  it("設定を開いても、パスキーのボタンは出ない", async () => {
    render(<AppHeader {...base} />);

    await userEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(
      screen.queryByRole("button", { name: "パスキーを登録" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "パスキーでログイン" }),
    ).not.toBeInTheDocument();
  });

  it("設定を開くとGoogleで続けるが出る", async () => {
    render(<AppHeader {...base} />);

    await userEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(
      screen.getByRole("link", { name: "Googleで続ける" }),
    ).toBeInTheDocument();
  });

  it("未登録なら、今の状態を出す", async () => {
    render(<AppHeader {...base} />);

    await userEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(
      screen.getByText("未登録：今はこの端末からしか開けません"),
    ).toBeInTheDocument();
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
