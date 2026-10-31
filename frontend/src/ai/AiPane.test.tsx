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

  it("⌘Enterでも送れる。Enterだけなら改行する", async () => {
    const onSend = vi.fn();
    render(<AiPane {...base} onSend={onSend} />);
    const textbox = screen.getByRole("textbox");

    // 何も書いていないうちは、⌘Enterでも送らない
    await userEvent.type(textbox, "{Meta>}{Enter}{/Meta}");
    await userEvent.type(textbox, "聞いて{Enter}それでね{Meta>}{Enter}{/Meta}");

    expect(onSend).toHaveBeenCalledExactlyOnceWith("fake", "聞いて\nそれでね");
  });

  it("渡されたAIだけを、渡された順に並べる", () => {
    render(<AiPane {...base} providers={["fake", "claude"]} />);

    const names = screen.getAllByRole("option").map((o) => o.textContent);
    expect(names).toEqual(["お試し", "Claude"]);
  });

  it("AIが1つだけなら、選ぶ箱は出さずに、そのAIに送る", async () => {
    const onSend = vi.fn();
    render(<AiPane {...base} providers={["gemini"]} onSend={onSend} />);

    await userEvent.type(screen.getByRole("textbox"), "聞いて");
    await userEvent.click(screen.getByRole("button", { name: "送る" }));

    // 使う人が迷わないよう、選べるものが1つなら箱は見せない
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(onSend).toHaveBeenCalledWith("gemini", "聞いて");
  });

  it("選べるAIが無ければ、準備中と伝えて、話しかける欄は出さない", () => {
    render(<AiPane {...base} providers={[]} />);

    expect(
      screen.getByText("AIは準備中です。もう少しお待ちください"),
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
    render(
      <AiPane {...base} error="今日はここまでです。また明日お話ししましょう" />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "今日はここまでです。また明日お話ししましょう",
    );
  });

  it("マウスのある画面では、開いたらすぐ話しかけられる", () => {
    render(<AiPane {...base} />);

    expect(screen.getByRole("textbox")).toHaveFocus();
  });
});
