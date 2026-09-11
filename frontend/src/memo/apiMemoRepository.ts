import type { Memo, MemoRepository } from "./types";

const API_BASE = "http://localhost:3000";

export const apiMemoRepository: MemoRepository = {
  async create(input) {
    const res = await fetch(`${API_BASE}/memos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`create failed: ${res.status}`);
    return res.json() as Promise<Memo>;
  },

  async update(id, input) {
    const res = await fetch(`${API_BASE}/memos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
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
};
