import { describe, it, expect, vi, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useAi } from "./useAi";

describe("useAi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("選べるAIを、サーバから受け取る", async () => {
    const body = JSON.stringify({ providers: ["fake", "claude"] });
    const fetchMock = vi.fn().mockResolvedValue(new Response(body));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAi());

    await waitFor(() =>
      expect(result.current.providers).toEqual(["fake", "claude"]),
    );
    const [url] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/ai\/providers$/);
  });

  it("受け取れなかったら、どのAIも選べない", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));

    const { result } = renderHook(() => useAi());

    await waitFor(() => expect(result.current.providers).toEqual([]));
  });

  it("書いたことと返事を、会話に足していく", async () => {
    const providers = JSON.stringify({ providers: ["fake"] });
    const reply = JSON.stringify({ reply: "どうしたの？" });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(providers))
      .mockResolvedValueOnce(new Response(reply));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useAi());

    await act(() => result.current.send("fake", "日記", "聞いて"));

    const said = { role: "user", content: "聞いて" };
    expect(result.current.messages).toEqual([
      said,
      { role: "assistant", content: "どうしたの？" },
    ]);
    // 日記と、ここまでの会話を、ログインのCookieをつけて送る
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toMatch(/\/ai\/chat$/);
    expect(init.credentials).toBe("include");
    expect(JSON.parse(init.body)).toEqual({
      provider: "fake",
      diary: "日記",
      messages: [said],
    });
  });

  it("断られたら、サーバの言葉を出して、待つのをやめる", async () => {
    const providers = JSON.stringify({ providers: ["fake"] });
    const refused = JSON.stringify({
      message: "今日はここまで。また明日話そうね",
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(providers))
      .mockResolvedValueOnce(new Response(refused, { status: 429 }));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useAi());

    await act(() => result.current.send("fake", "日記", "聞いて"));

    expect(result.current.error).toBe("今日はここまで。また明日話そうね");
    expect(result.current.isWaiting).toBe(false);
  });

  it("別の日記に移ったら、会話を最初からにする。待っていた返事が後から届いても足さない", async () => {
    const providers = JSON.stringify({ providers: ["fake"] });
    // 返事を届けるのは、テストが決めたとき
    let deliver: (res: Response) => void = () => {};
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(providers))
      .mockReturnValueOnce(new Promise((resolve) => (deliver = resolve)));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useAi());

    let sending = Promise.resolve();
    act(() => {
      sending = result.current.send("fake", "日記", "聞いて");
    });
    act(() => result.current.reset());
    await act(async () => {
      deliver(new Response(JSON.stringify({ reply: "どうしたの？" })));
      await sending;
    });

    expect(result.current.messages).toEqual([]);
  });
});
