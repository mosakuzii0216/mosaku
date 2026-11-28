import type { Memo } from "./types";

// その日の名前。例：2026-01-05
// 端末の時刻で数えるので、夜中の0時半に書いたら、その日の分になる
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// マップの1マス。1マスが1日
export type MapDay = {
  key: string;
  date: Date;
  isWritten: boolean;
  isFuture: boolean;
};

// 書いた日のマップに並べるマス。日曜から土曜を1列にして、weeks週ぶんを古い順に並べる
// 日記の上に出す日付と同じで、作った日(createdAt)で数える
export function mapDays(memos: Memo[], today: Date, weeks = 12): MapDay[] {
  // 書いた日の名前を集める。同じ日に2つ書いても1つになる
  const written = new Set(
    memos.map((memo) => dayKey(new Date(memo.createdAt))),
  );
  const year = today.getFullYear();
  const month = today.getMonth();
  // 左上のマス=(weeks-1)週前の日曜。getDay()は曜日の番号で、日曜が0、土曜が6
  const first = today.getDate() - today.getDay() - (weeks - 1) * 7;

  const days: MapDay[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    // 日にちが0以下でも、Dateが前の月の日に直してくれる(11月0日→10月31日)
    const date = new Date(year, month, first + i);
    const key = dayKey(date);
    days.push({
      key,
      date,
      isWritten: written.has(key),
      isFuture: date > today,
    });
  }
  return days;
}
