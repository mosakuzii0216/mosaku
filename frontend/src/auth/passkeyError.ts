// パスキーの失敗を画面にそのまま出せる言葉にする
export function passkeyErrorMessage(e: unknown): string {
  if (!(e instanceof Error)) return "うまくいきませんでした";

  // OSの確認画面で「キャンセル」を押した、または時間切れ
  if (e.name === "NotAllowedError") return "キャンセルしました";
  // 同じ端末で2回目の登録をしようとした
  if (e.name === "InvalidStateError") {
    return "この端末のパスキーは既に登録されています";
  }
  // fetchがサーバに届かなかった(オフラインなど)
  if (e instanceof TypeError) return "通信できませんでした";

  // ここまで来たら、サーバが返した理由(日本語)が入っている
  return e.message;
}
