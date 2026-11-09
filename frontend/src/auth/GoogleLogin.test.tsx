import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoogleLogin } from "./GoogleLogin";

describe("GoogleLogin", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("コードを打たなければ、確かめずにGoogleへ行く", async () => {
    // 本当には移らずに、行き先だけ受け取る
    const go = vi.spyOn(window.location, "assign").mockImplementation(() => {});
    const onCheck = vi.fn();
    render(<GoogleLogin onCheck={onCheck} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Googleで続ける" }),
    );

    expect(onCheck).not.toHaveBeenCalled();
    expect(go).toHaveBeenCalledWith(expect.stringMatching(/\/start$/));
  });

  it("使えないコードなら理由を出し、打ち直して使えたら、コードを持ってGoogleへ行く", async () => {
    const go = vi.spyOn(window.location, "assign").mockImplementation(() => {});
    const onCheck = vi
      .fn()
      .mockResolvedValueOnce("not_found")
      .mockResolvedValueOnce(null);
    render(<GoogleLogin onCheck={onCheck} />);
    const input = screen.getByLabelText("招待コード");
    const button = screen.getByRole("button", { name: "Googleで続ける" });

    await userEvent.type(input, "ABCD-EFGX");
    await userEvent.click(button);
    expect(screen.getByRole("alert")).toHaveTextContent("見つかりません");
    expect(go).not.toHaveBeenCalled();

    await userEvent.clear(input);
    await userEvent.type(input, "ABCD-EFGH");
    await userEvent.click(button);
    expect(onCheck).toHaveBeenLastCalledWith("ABCD-EFGH");
    expect(go).toHaveBeenCalledWith(
      expect.stringMatching(/\/start\?invite=ABCD-EFGH$/),
    );
  });
});
