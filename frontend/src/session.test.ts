import { describe, it, expect, vi, afterEach } from "vitest";
import { ensureSession } from "./session";

describe("ensureSession", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Cookie付きで/meを1回呼ぶ", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);

    await ensureSession();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/me$/);
    expect(init.credentials).toBe("include");
  });

  it("通信に失敗しても例外を投げない", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));

    await expect(ensureSession()).resolves.toBeUndefined();
  });
});
