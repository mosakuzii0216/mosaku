// Googleから「失敗」で戻ってきたか(?login=failed)を読み取る
// 読んだらURLからは消す。消さないとリロードのたびにまた知らせが出てしまう
export function takeLoginFailed(): boolean {
  const url = new URL(window.location.href);
  if (url.searchParams.get("login") !== "failed") return false;

  url.searchParams.delete("login");
  window.history.replaceState(null, "", url);
  return true;
}
