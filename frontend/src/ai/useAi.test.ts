import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
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
});
