import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeedbackForm } from "./FeedbackForm";

describe("FeedbackForm", () => {
  it("書いて送ると、前後の空白を除いて渡し、届いたと伝えて欄を空にする", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<FeedbackForm onSend={onSend} />);
    const textbox = screen.getByRole("textbox");
    const send = screen.getByRole("button", { name: "送る" });

    // 空白だけのうちは、送れない
    await userEvent.type(textbox, "　");
    expect(send).toBeDisabled();
    await userEvent.type(textbox, "保存されたか分かりにくい ");
    await userEvent.click(send);

    expect(onSend).toHaveBeenCalledWith("保存されたか分かりにくい");
    expect(
      screen.getByText("届きました。ありがとうございます"),
    ).toBeInTheDocument();
    expect(textbox).toHaveValue("");
  });

  it("届かなかったら、書いたものを残して、もう一度と伝える", async () => {
    const onSend = vi.fn().mockRejectedValue(new Error("feedback failed: 500"));
    render(<FeedbackForm onSend={onSend} />);

    await userEvent.type(screen.getByRole("textbox"), "ありがとう");
    await userEvent.click(screen.getByRole("button", { name: "送る" }));

    expect(
      screen.getByText(
        "うまく届きませんでした。少し待って、もう一度送ってください",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("ありがとう");
  });
});
