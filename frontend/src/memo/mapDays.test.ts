import { describe, it, expect } from "vitest";
import { dayKey, mapDays } from "./mapDays";
import type { Memo } from "./types";

describe("dayKey", () => {
  it("その日の名前を、端末の時刻で作る", () => {
    // 2026年1月5日の夜中0時半。月も日も2桁に揃える
    expect(dayKey(new Date(2026, 0, 5, 0, 30))).toBe("2026-01-05");
  });
});

// 書いた時刻だけを決めたメモ。ほかの欄は、マップでは見ない
const memoAt = (date: Date): Memo => ({
  id: date.toISOString(),
  title: "",
  content: null,
  createdAt: date.toISOString(),
  updatedAt: date.toISOString(),
  trashedAt: null,
  contentText: null,
});

describe("mapDays", () => {
  // 2026年11月26日(木)
  const today = new Date(2026, 10, 26);

  it("12週ぶんのマスを、11週前の日曜から今週の土曜まで並べる", () => {
    const days = mapDays([], today);

    expect(days).toHaveLength(84);
    expect(days[0].key).toBe("2026-09-06");
    expect(days[83].key).toBe("2026-11-28");
  });

  it("書いた日のマスに印を付ける。同じ日に2つ書いても1日", () => {
    const days = mapDays(
      [
        memoAt(new Date(2026, 10, 24, 0, 30)),
        memoAt(new Date(2026, 10, 24, 23, 50)),
      ],
      today,
    );

    const written = days.filter((day) => day.isWritten).map((day) => day.key);
    expect(written).toEqual(["2026-11-24"]);
  });

  it("今日より後の日は、まだ来ていない日として分ける", () => {
    const days = mapDays([], today);

    const future = days.filter((day) => day.isFuture).map((day) => day.key);
    expect(future).toEqual(["2026-11-27", "2026-11-28"]);
  });
});
