import type { Memo, MemoRepository } from "./types";

const API_BASE = "http://localhost:3000";

export const apiMemoRepository: MemoRepository = {
  async create(input) {
    const res = await fetch(`${API_BASE}/memos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`create failed: $(res.status}`);
    return res.json() as Promise<Memo>;
  },

  async findAll() {
    const res = await fetch(`${API_BASE}/memos`);
    if (!res.ok) throw new Error(`findAll failed: ${res.status}`);
    return res.json() as Promise<Memo[]>;
  },
};
