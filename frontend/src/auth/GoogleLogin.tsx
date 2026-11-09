import { useState, type SubmitEvent } from "react";
import type { InviteFailure } from "../invitation/invitationApi";
import { inviteMessage } from "../invitation/inviteMessage";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";
const START = `${API_BASE}/auth/google/start`;

type Props = {
  // 打った招待コードを確かめる。使えればnull、使えなければ理由を返す
  onCheck: (code: string) => Promise<InviteFailure | null>;
};

// Googleで続ける入り口。招待コードが打たれていたら、確かめてから一緒に持っていく
export function GoogleLogin({ onCheck }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const invite = code.trim();
    // コードが無くても登録はできる。AIは使えない
    if (invite === "") {
      window.location.assign(START);
      return;
    }
    try {
      const reason = await onCheck(invite);
      if (reason) {
        setError(inviteMessage(reason));
      } else {
        // ページごとGoogleへ移る。コードは、Googleから戻るまでbackendが預かる
        window.location.assign(`${START}?invite=${encodeURIComponent(invite)}`);
      }
    } catch {
      setError(
        "うまく確かめられませんでした。少し待って、もう一度押してください",
      );
    }
  };

  return (
    <form className="google-login" onSubmit={handleSubmit}>
      <input
        className="invite-input"
        aria-label="招待コード"
        placeholder="招待コード（あれば）"
        // サーバが受け取れる長さ(backendのinvitation.dto.tsと同じ数)
        maxLength={20}
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      {error && (
        <p className="invite-error" role="alert">
          {error}
        </p>
      )}
      <button className="ghost-button">Googleで続ける</button>
    </form>
  );
}
