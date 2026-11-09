// 招待コードを使えなかった理由(backendのCheckFailure)を、画面に出す文にする
// 打ち直せばいいのか、招待した人に新しいコードをもらえばいいのかが分かるようにする
export function inviteMessage(reason: string): string {
  switch (reason) {
    case "not_found":
      return "招待コードが見つかりません。打ち間違いが無いか確かめてください";
    case "used":
      return "この招待コードは、もう使われています。招待した人に、新しいコードをもらってください";
    case "expired":
      return "この招待コードは、期限が切れています。招待した人に、新しいコードをもらってください";
    case "revoked":
      return "この招待コードは、取り消されています。招待した人に、新しいコードをもらってください";
    default:
      return "招待コードを使えませんでした";
  }
}
