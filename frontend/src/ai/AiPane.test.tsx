import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiPane } from "./AiPane";
import { AI_PROVIDERS } from "./providers";

const base = {
  providers: AI_PROVIDERS,
  messages: [],
  isWaiting: false,
  error: "",
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

  it("渡されたAIだけを、渡された順に並べる", () => {
    render(<AiPane {...base} providers={["fake", "claude"]} />);

    const names = screen.getAllByRole("option").map((o) => o.textContent);
    expect(names).toEqual(["お試し", "Claude"]);
  });

  it("選べるAIが無ければ、準備中と伝えて、話しかける欄は出さない", () => {
    render(<AiPane {...base} providers={[]} />);

    expect(
      screen.getByText("AIは準備中。もう少し待っててね"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("話したことと返事を、順に並べる", () => {
    render(
      <AiPane
        {...base}
        messages={[
          { role: "user", content: "聞いて" },
          { role: "assistant", content: "どうしたの？" },
        ]}
      />,
    );

    const items = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(items).toEqual(["聞いて", "どうしたの？"]);
  });

  it("返事を待つ間は、考え中と出して、次は送れない", async () => {
    render(
      <AiPane
        {...base}
        messages={[{ role: "user", content: "聞いて" }]}
        isWaiting
      />,
    );

    await userEvent.type(screen.getByRole("textbox"), "それでね");

    expect(screen.getByText("考え中...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "送る" })).toBeDisabled();
  });

  it("断られたら、その理由を見せる", () => {
    render(<AiPane {...base} error="今日はここまで。また明日話そうね" />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "今日はここまで。また明日話そうね",
    );
  });
});
