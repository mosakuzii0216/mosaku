import { describe, it, expect, vi, afterEach } from "vitest";
import { chatWithAi, type ChatMessage } from "./aiAPi";

describe("chatWithAi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("長い会話は、新しい方の20通までを、書いた人の言葉から送る", async () => {
    const reply = JSON.stringify({ reply: "うん" });
    const fetchMock = vi.fn().mockResolvedValue(new Response(reply));
    vi.stubGlobal("fetch", fetchMock);
    // 10往復したあとに、11回目を書いたところ(21通)
    const messages: ChatMessage[] = Array.from({ length: 21 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `${i}`,
    }));

    await chatWithAi("fake", "日記", messages);

    // 新しい20通は返事から始まるので、それも落として19通
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.messages).toHaveLength(19);
    expect(sent.messages[0]).toEqual({ role: "user", content: "2" });
  });

  it("長い日記と長い1通は、サーバが受け取れる長さまでにして送る", async () => {
    const reply = JSON.stringify({ reply: "うん" });
    const fetchMock = vi.fn().mockResolvedValue(new Response(reply));
    vi.stubGlobal("fetch", fetchMock);
    const long: ChatMessage = { role: "user", content: "あ".repeat(2001) };

    await chatWithAi("fake", "い".repeat(8001), [long]);

    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.diary).toHaveLength(8000);
    expect(sent.messages[0].content).toHaveLength(2000);
  });
});
