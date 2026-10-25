import type { Memo, MemoRepository } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

// 保存は、画面を閉じても送り終わるまで続けてもらう。
// ただし続けてもらえるのは64KB。超えると送れなくなるので、そのときは普通に送る
const keepalive = (body: string) => new Blob([body]).size <= 64 * 1024;

export const apiMemoRepository: MemoRepository = {
  async create(input) {
    const body = JSON.stringify(input);
    const res = await fetch(`${API_BASE}/memos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body,
      keepalive: keepalive(body),
    });
    if (!res.ok) throw new Error(`create failed: ${res.status}`);
    return res.json() as Promise<Memo>;
  },

  async update(id, input) {
    const body = JSON.stringify(input);
    const res = await fetch(`${API_BASE}/memos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body,
      keepalive: keepalive(body),
    });
    if (!res.ok) throw new Error(`update failed: ${res.status}`);
    return res.json() as Promise<Memo>;
  },

  async remove(id) {
    const res = await fetch(`${API_BASE}/memos/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`remove failed: ${res.status}`);
  },

  async findAll() {
    const res = await fetch(`${API_BASE}/memos`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(`findAll failed: ${res.status}`);
    return res.json() as Promise<Memo[]>;
  },

  async findTrashed() {
    const res = await fetch(`${API_BASE}/memos/trash`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(`findTrashed failed: ${res.status}`);
    return res.json() as Promise<Memo[]>;
  },

  async restore(id) {
    const res = await fetch(`${API_BASE}/memos/${id}/restore`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`restore failed: ${res.status}`);
    return res.json() as Promise<Memo>;
  },

  async purge(id) {
    const res = await fetch(`${API_BASE}/memos/${id}/purge`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`purge failed: ${res.status}`);
  },

  async search(q) {
    const res = await fetch(
      `${API_BASE}/memos/search?q=${encodeURIComponent(q)}`,
      { credentials: "include" },
    );
    if (!res.ok) throw new Error(`search failed: ${res.status}`);
    return res.json() as Promise<Memo[]>;
  },
};
