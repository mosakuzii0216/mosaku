import { useCallback, useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { apiMemoRepository } from "./apiMemoRepository";
import type { Memo } from "./types";
import { useAutoSave } from "./useAutoSave";

export function useMemos(editor: Editor | null) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [trashed, setTrashed] = useState<Memo[]>([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  // また保存していない書き換えの数。保存を始めたら0に戻す
  const [changes, setChanges] = useState(0);

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

  // 本文を書き換えるたびに数える
  useEffect(() => {
    if (!editor) return;
    const count = () => setChanges((n) => n + 1);
    editor.on("update", count);
    return () => {
      editor.off("update", count);
    };
  }, [editor]);

  // タイトルを書き換えたときも数える
  const changeTitle = (value: string) => {
    setTitle(value);
    setChanges((n) => n + 1);
  };

  const startNew = async () => {
    // 書きかけがあれば、先に保存してから白紙にする
    if (changes > 0) await save();
    setChanges(0);
    setEditingId(null);
    setTitle("");
    // 中身の差し替えはm、書き換えに数えない
    editor?.commands.setContent("<p></p>", { emitUpdate: false });
    setStatus("");
  };

  const open = async (memo: Memo) => {
    // 書きかけがあれば、先に保存してから開く
    if (changes > 0) await save();
    setChanges(0);
    setEditingId(memo.id);
    setTitle(memo.title);
    editor?.commands.setContent(memo.content as never, { emitUpdate: false });
    setStatus("");
  };

  const save = async () => {
    // 保存中にもう一度呼ばれても無視する(連打で新規作成が2回走るのを防ぐ)
    if (!editor || saving) return;
    // 何も書いていない新しいメモは作らない
    if (!editingId && title.trim() === "" && editor.isEmpty) return;
    setSaving(true);
    setStatus("保存中...");
    // ここまでの書き換えは、この保存に入る。保存中に書いた分は、また数える
    setChanges(0);
    try {
      const input = { title, content: editor.getJSON() };
      const memo = editingId
        ? await apiMemoRepository.update(editingId, input)
        : await apiMemoRepository.create(input);
      // 保存の間に別のメモを開いていたら、そちらのままにする
      setEditingId((current) => (current === editingId ? memo.id : current));
      setStatus(editingId ? "更新しました" : "保存しました");
      await reload();
    } catch (e) {
      setStatus(`失敗: ${String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  // 書き換えが止まって1.5秒たったら、自動で保存する
  useAutoSave(changes, saving, save);

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
    changeTitle,
    editingId,
    status,
    saving,
    reload,
    startNew,
    open,
    save,
    remove,
    restore,
    purge,
  };
}
