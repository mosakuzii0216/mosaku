import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppHeader } from "./AppHeader";

const base = {
  query: "",
  theme: "system" as const,
  onQueryChange: () => {},
  onThemeChange: () => {},
  onLogin: () => {},
};

describe("AppHeader", () => {
  it("検索欄に打つとonQueryChangeが呼ばれる", async () => {
    const onQueryChange = vi.fn();
    render(<AppHeader {...base} onQueryChange={onQueryChange} />);

    await userEvent.type(screen.getByRole("searchbox"), "森");

    expect(onQueryChange).toHaveBeenCalledWith("森");
  });

  it("テーマとパスキーのボタンを並べる", () => {
    render(<AppHeader {...base} />);

    expect(screen.getByRole("button", { name: "森" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "パスキーでログイン" }),
    ).toBeInTheDocument();
  });
});
