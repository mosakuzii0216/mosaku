const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

export type Me = { hasPasskey: boolean; hasGoogle: boolean };

export async function fetchMe(): Promise<Me> {
  const res = await fetch(`${API_BASE}/me`, { credentials: "include" });
  if (!res.ok) throw new Error(`me failed: ${res.status}`);
  return res.json() as Promise<Me>;
}
