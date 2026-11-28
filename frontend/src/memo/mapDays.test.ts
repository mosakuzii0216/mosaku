import { describe, it, expect } from "vitest";
import { dayKey } from "./mapDays";

describe("dayKey", () => {
  it("その日の名前を、端末の時刻で作る", () => {
    // 2026年1月5日の夜中0時半。月も日も2桁に揃える
    expect(dayKey(new Date(2026, 0, 5, 0, 30))).toBe("2026-01-05");
  });
});
