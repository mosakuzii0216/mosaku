import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSwitch } from "./ThemeSwitch";

describe("ThemeSwitch", () => {
  it("霧の森・暁の丘・昼の縁側・夜の書斎の4つで並べる", () => {
    render(<ThemeSwitch theme="yoru" onChange={() => {}} />);

    const labels = screen.getAllByRole("button").map((b) => b.textContent);
    expect(labels).toEqual(["霧の森", "暁の丘", "昼の縁側", "夜の書斎"]);
  });

  it("選択中のテーマにis-activeが付く", () => {
    render(<ThemeSwitch theme="mori" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "霧の森" })).toHaveClass(
      "is-active",
    );
    expect(screen.getByRole("button", { name: "昼の縁側" })).not.toHaveClass(
      "is-active",
    );
  });

  it("押すとonChangeにそのテーマが渡る", async () => {
    const onChange = vi.fn();
    render(<ThemeSwitch theme="yoru" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "霧の森" }));

    expect(onChange).toHaveBeenCalledWith("mori");
  });

  // 印を目当てに、CSSがボタンごとにそのテーマの空を描く
  it("ボタンに、そのテーマの印を付ける", () => {
    render(<ThemeSwitch theme="mori" onChange={() => {}} />);

    const button = screen.getByRole("button", { name: "暁の丘" });
    expect(button).toHaveAttribute("data-theme", "asa");
  });
});
