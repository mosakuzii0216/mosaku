import { useCallback, useEffect, useState } from "react";
import type { Invitation, Invitations } from "./invitationApi";

type Props = {
  // 自分が作ったコードの一覧と、あと何枚作れるかを読む
  onLoad: () => Promise<Invitations>;
  // コードを1枚作る
  onCreate: () => Promise<void>;
};

// コードの状態を、画面に出す言葉に直す。まだ使われていないコードは、いつまで使えるかを出す
function statusText(invitation: Invitation): string {
  switch (invitation.status) {
    case "unused": {
      const date = new Date(invitation.expiresAt).toLocaleDateString("ja-JP", {
        month: "long",
        day: "numeric",
      });
      return `${date}まで`;
    }
    case "used":
      return "使われた";
    case "expired":
      return "期限切れ";
    case "revoked":
      return "取り消した";
  }
}

// 招待モーダルの中身。開いたら、自分が作ったコードの一覧を読む
export function InvitationPanel({ onLoad, onCreate }: Props) {
  // 一覧が届くまではundefined
  const [data, setData] = useState<Invitations>();
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setData(await onLoad());
    } catch {
      setError("一覧を読めませんでした。少し待って、開き直してください");
    }
  }, [onLoad]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // 作るのも取り消すのも、終わったら一覧を読み直す
  const run = async (action: () => Promise<void>) => {
    setError("");
    try {
      await action();
      await reload();
    } catch {
      setError("うまくいきませんでした。少し待って、もう一度押してください");
    }
  };

  return (
    <div className="invite-panel">
      <p className="invite-note">
        コードを送ると、相手は登録するときに打てます。招待で登録した人は、AIを使えます
      </p>
      <div className="invite-actions">
        <button
          className="ghost-button"
          // 一覧が届くまでと、あと0枚のときは押せない。開発者は上限が無い
          disabled={!data || data.remaining === 0}
          onClick={() => void run(onCreate)}
        >
          コードを作る
        </button>
        {data && data.remaining !== null && (
          <span className="invite-remaining">あと{data.remaining}枚</span>
        )}
      </div>
      {error && (
        <p className="invite-error" role="alert">
          {error}
        </p>
      )}
      {data?.invitations.length === 0 && (
        <p className="invite-empty">まだコードはありません</p>
      )}
      <ul className="invite-list">
        {data?.invitations.map((invitation) => (
          <li key={invitation.id} className="invite-item">
            <code className="invite-code">{invitation.code}</code>
            <span className="invite-status">{statusText(invitation)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
