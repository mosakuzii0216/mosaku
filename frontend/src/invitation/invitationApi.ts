const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

// 招待コードを使えない理由。backendのCheckFailureと同じ4つ
export type InviteFailure = "not_found" | "used" | "expired" | "revoked";

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
