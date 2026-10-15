import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSwitch } from "./ThemeSwitch";

describe("ThemeSwitch", () => {
  it("夜・森・ライトの3つで並べる", () => {
    render(<ThemeSwitch theme="yoru" onChange={() => {}} />);

    const labels = screen.getAllByRole("button").map((b) => b.textContent);
    expect(labels).toEqual(["夜", "森", "ライト"]);
  });

  it("選択中のテーマにis-activeが付く", () => {
    render(<ThemeSwitch theme="mori" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "森" })).toHaveClass("is-active");
    expect(screen.getByRole("button", { name: "ライト" })).not.toHaveClass(
      "is-active",
    );
  });

  it("押すとonChangeにそのテーマが渡る", async () => {
    const onChange = vi.fn();
    render(<ThemeSwitch theme="yoru" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "森" }));

    expect(onChange).toHaveBeenCalledWith("mori");
  });
});
