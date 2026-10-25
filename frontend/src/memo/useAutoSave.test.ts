import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAutoSave } from "./useAutoSave";

// タブを閉じる・アプリを切り替えるなどで、画面が隠れる
function hide() {
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("useAutoSave", () => {
  // 本当に1.5秒待たずに、時計だけ進める
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    // 隠したままにしない
    vi.restoreAllMocks();
  });

  it("書き換えて1.5秒たつと保存する", () => {
    const save = vi.fn();
    renderHook(() => useAutoSave(1, false, save));

    vi.advanceTimersByTime(1500);

    expect(save).toHaveBeenCalledTimes(1);
  });

  it("1.5秒たつ前にまた書き換えたら、そこから数え直す", () => {
    const save = vi.fn();
    const { rerender } = renderHook(
      ({ changes }) => useAutoSave(changes, false, save),
      { initialProps: { changes: 1 } },
    );

    vi.advanceTimersByTime(1000);
    rerender({ changes: 2 });
    vi.advanceTimersByTime(1000);
    expect(save).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("書き換えていなければ保存しない", () => {
    const save = vi.fn();
    renderHook(() => useAutoSave(0, false, save));

    vi.advanceTimersByTime(5000);
    hide();

    expect(save).not.toHaveBeenCalled();
  });

  it("保存中は待って、終わってから1.5秒で保存する", () => {
    const save = vi.fn();
    const { rerender } = renderHook(
      ({ saving }) => useAutoSave(1, saving, save),
      { initialProps: { saving: true } },
    );

    vi.advanceTimersByTime(5000);
    expect(save).not.toHaveBeenCalled();

    rerender({ saving: false });
    vi.advanceTimersByTime(1500);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("画面が隠れたら、1.5秒待たずにすぐ保存する", () => {
    const save = vi.fn();
    const { rerender } = renderHook(
      ({ changes }) => useAutoSave(changes, false, save),
      { initialProps: { changes: 1 } },
    );
    rerender({ changes: 2 });

    hide();

    // 書き換えるたびに見張りを付け直す。古い見張りを外し忘れると、2回保存してしまう
    expect(save).toHaveBeenCalledTimes(1);
  });
});
