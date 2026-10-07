import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GoogleLogin } from "./GoogleLogin";

describe("GoogleLogin", () => {
  it("未連携なら、Googleへ行くリンクを出す", () => {
    render(<GoogleLogin linked={false} />);

    expect(
      screen.getByRole("link", { name: "Googleで続ける" }),
    ).toHaveAttribute("href", expect.stringMatching(/\/auth\/google\/start$/));
  });

  it("連携済みなら、リンクを出さずに連携済みと出す", () => {
    render(<GoogleLogin linked />);

    expect(screen.getByText("Googleと連携済み")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
