import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { apiMemoRepository } from "./memo/apiMemoRepository";
import type { Memo } from "./memo/types";
import { MemoList } from "./memo/MemoList";
import { MemoForm } from "./memo/MemoForm";
import { ThemeSwitch } from "./ThemeSwitch";
import { PasskeyRegister } from "./auth/PasskeyRegister";
import { TrashList } from "./memo/TrashList";
import { useTheme } from "./useTheme";
import "./App.css";

export default function App() {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [memos, setMemos] = useState<Memo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [theme, setTheme] = useTheme();
  const [trashed, setTrashed] = useState<Memo[]>([]);
  const [showTrash, setShowTrash] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p></p>",
  });

  const reload = async () => {
    const [active, inTrash] = await Promise.all([
      apiMemoRepository.findAll(),
      apiMemoRepository.findTrashed(),
    ]);
    setMemos(active);
    setTrashed(inTrash);
  };

  useEffect(() => {
    void reload();
  }, []);

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault(); // ブラウザの「ページ保存」を止める
        void save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const open = (memo: Memo) => {
    setEditingId(memo.id);
    setTitle(memo.title);
    editor?.commands.setContent(memo.content as never);
    setStatus("");
  };

  const startNew = () => {
    setEditingId(null);
    setTitle("");
    editor?.commands.setContent("<p></p>");
    setStatus("");
  };

  const remove = async (memo: Memo) => {
    setStatus("削除中...");
    try {
      await apiMemoRepository.remove(memo.id);
      if (editingId === memo.id) startNew();
      setStatus("ゴミ箱に移動しました");
      await reload();
    } catch (e) {
      setStatus(`失敗： ${String(e)}`);
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

  return (
    <div className="page">
      <ThemeSwitch theme={theme} onChange={setTheme} />
      <PasskeyRegister onLogin={reload} />

      <MemoForm
        title={title}
        status={status}
        isEditing={editingId !== null}
        onTitleChange={setTitle}
        onSave={save}
        onNew={startNew}
      >
        <EditorContent editor={editor} />
      </MemoForm>

      <h2>メモ一覧</h2>
      <MemoList
        memos={memos}
        editingId={editingId}
        onOpen={open}
        onRemove={remove}
      />

      <h2>
        <button
          className="trash-toggle"
          onClick={() => setShowTrash((v) => !v)}
        >
          ゴミ箱 ({trashed.length}) {showTrash ? "▲" : "▼"}
        </button>
      </h2>
      {showTrash && (
        <TrashList memos={trashed} onRestore={restore} onPurge={purge} />
      )}
    </div>
  );
}
