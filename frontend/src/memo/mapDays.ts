// その日の名前。例：2026-01-05
// 端末の時刻で数えるので、夜中の0時半に書いたら、その日の分になる
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
