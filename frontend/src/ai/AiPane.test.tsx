import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiPane } from "./AiPane";
import { AI_PROVIDERS } from "./providers";

const base = {
  providers: AI_PROVIDERS,
  onSend: () => {},
  onClose: () => {},
};

describe("AiPane", () => {
  it("閉じるを押すとonCloseが呼ばれる", async () => {
    const onClose = vi.fn();
    render(<AiPane {...base} onClose={onClose} />);

    await userEvent.click(
      screen.getByRole("button", { name: "AIとの会話を閉じる" }),
    );

    expect(onClose).toHaveBeenCalled();
  });

  it("選んだAIと書いたことを送り、欄を空に戻す", async () => {
    const onSend = vi.fn();
    render(<AiPane {...base} onSend={onSend} />);
    // 何も書いていないうちは送れない
    expect(screen.getByRole("button", { name: "送る" })).toBeDisabled();

    await userEvent.selectOptions(screen.getByRole("combobox"), "Gemini");
    await userEvent.type(screen.getByRole("textbox"), "うまく言えない");
    await userEvent.click(screen.getByRole("button", { name: "送る" }));

    expect(onSend).toHaveBeenCalledWith("gemini", "うまく言えない");
    expect(screen.getByRole("textbox")).toHaveValue("");
  });
});
