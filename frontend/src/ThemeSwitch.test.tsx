import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSwitch } from "./ThemeSwitch";

describe("ThemeSwitch", () => {
  it("4つのテーマをボタンで並べる", () => {
    render(<ThemeSwitch theme="system" onChange={() => {}} />);

    expect(
      screen.getByRole("button", { name: "OSに従う" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ライト" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ダーク" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "森" })).toBeInTheDocument();
  });

  it("洗濯中のテーマにis-activeが付く", () => {
    render(<ThemeSwitch theme="mori" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "森" })).toHaveClass("is-active");
    expect(screen.getByRole("button", { name: "ライト" })).not.toHaveClass(
      "is-active",
    );
  });

  it("押すとonChangeにそのテーマが渡る", async () => {
    const onChange = vi.fn();
    render(<ThemeSwitch theme="system" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "森" }));

    expect(onChange).toHaveBeenCalledWith("mori");
  });
});
