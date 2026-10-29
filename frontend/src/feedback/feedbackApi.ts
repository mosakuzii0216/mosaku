const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

// 目安箱に声を送る。誰が送ったかはサーバがCookieで知るので、Cookieも送る
export async function sendFeedback(message: string): Promise<void> {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`feedback failed: ${res.status}`);
}
