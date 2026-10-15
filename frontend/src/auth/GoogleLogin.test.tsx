import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GoogleLogin } from "./GoogleLogin";

describe("GoogleLogin", () => {
  it("Googleへ行くリンクを出す", () => {
    render(<GoogleLogin />);

    expect(
      screen.getByRole("link", { name: "Googleで続ける" }),
    ).toHaveAttribute("href", expect.stringMatching(/\/auth\/google\/start$/));
  });
});
