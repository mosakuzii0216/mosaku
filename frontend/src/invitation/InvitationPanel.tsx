import { useCallback, useEffect, useState } from "react";
import type { Invitation, Invitations } from "./invitationApi";

type Props = {
  // 自分が作ったコードの一覧と、あと何枚作れるかを読む
  onLoad: () => Promise<Invitations>;
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
export function InvitationPanel({ onLoad }: Props) {
  // 一覧が届くまではundefined
  const [data, setData] = useState<Invitations>();

  const reload = useCallback(async () => {
    setData(await onLoad());
  }, [onLoad]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <div className="invite-panel">
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
