import { useCallback, useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { apiMemoRepository } from "./apiMemoRepository";
import type { Memo } from "./types";

export function useMemos(editor: Editor | null) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [trashed, setTrashed] = useState<Memo[]>([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const reload = useCallback(async () => {
    const [active, inTrash] = await Promise.all([
      apiMemoRepository.findAll(),
      apiMemoRepository.findTrashed(),
    ]);
    setMemos(active);
    setTrashed(inTrash);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const startNew = () => {
    setEditingId(null);
    setTitle("");
    editor?.commands.setContent("<p></p>");
    setStatus("");
  };

  const open = (memo: Memo) => {
    setEditingId(memo.id);
    setTitle(memo.title);
    editor?.commands.setContent(memo.content as never);
    setStatus("");
  };

  const save = async () => {
    if (!editor) return;
    setStatus("保存中...");
    try {
      const input = { title, content: editor.getJSON() };
      const memo = editingId
        ? await apiMemoRepository.update(editingId, input)
        : await apiMemoRepository.create(input);
      setEditingId(memo.id);
      setStatus(editingId ? "更新しました" : "保存しました");
      await reload();
    } catch (e) {
      setStatus(`失敗: ${String(e)}`);
    }
  };

  const remove = async (memo: Memo) => {
    setStatus("削除中...");
    try {
      await apiMemoRepository.remove(memo.id);
      if (editingId === memo.id) startNew();
      setStatus("ゴミ箱に移動しました");
      await reload();
    } catch (e) {
      setStatus(`失敗: ${String(e)}`);
    }
  };

  const restore = async (memo: Memo) => {
    setStatus("復元中...");
    try {
      await apiMemoRepository.restore(memo.id);
      setStatus("復元しました");
      await reload();
    } catch (e) {
      setStatus(`失敗: ${String(e)}`);
    }
  };

  const purge = async (memo: Memo) => {
    // ここだけは戻せないので確認する
    if (!window.confirm(`「${memo.title}」を完全に削除しますか？`)) return;
    setStatus("削除中...");
    try {
      await apiMemoRepository.purge(memo.id);
      setStatus("完全に削除しました");
      await reload();
    } catch (e) {
      setStatus(`失敗: ${String(e)}`);
    }
  };

  return {
    memos,
    trashed,
    title,
    setTitle,
    editingId,
    status,
    reload,
    startNew,
    open,
    save,
    remove,
    restore,
    purge,
  };
}
