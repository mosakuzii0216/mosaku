const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

// 招待コードを使えない理由。backendのCheckFailureと同じ4つ
export type InviteFailure = "not_found" | "used" | "expired" | "revoked";

// 自分が作ったコードの状態。backendのInvitationStatusと同じ4つ
export type InvitationStatus = "unused" | "used" | "expired" | "revoked";

export type Invitation = {
  id: string;
  code: string;
  expiresAt: string;
  status: InvitationStatus;
};

// 招待モーダルに出すもの。開発者は上限が無いので、あと何枚作れるかはnull
export type Invitations = {
  invitations: Invitation[];
  remaining: number | null;
};

// 打ったコードを確かめる。使えればnull、使えなければ理由を返す
export async function checkInvitation(
  code: string,
): Promise<InviteFailure | null> {
  const res = await fetch(`${API_BASE}/invitations/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(`check failed: ${res.status}`);
  const body = (await res.json()) as { reason: InviteFailure | null };
  return body.reason;
}

// 自分が作ったコードの一覧と、あと何枚作れるかを読む
export async function fetchInvitations(): Promise<Invitations> {
  const res = await fetch(`${API_BASE}/invitations`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`invitations failed: ${res.status}`);
  return res.json() as Promise<Invitations>;
}

// コードを1枚作る。作ったコードは、一覧を読み直して出す
export async function createInvitation(): Promise<void> {
  const res = await fetch(`${API_BASE}/invitations`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`create failed: ${res.status}`);
}

// まだ使われていないコードを取り消す
export async function revokeInvitation(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/invitations/${id}/revoke`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`revoke failed: ${res.status}`);
}
