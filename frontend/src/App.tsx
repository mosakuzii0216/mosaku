import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { apiMemoRepository } from "./memo/apiMemoRepository";
import type { Memo } from "./memo/types";
import { MemoList } from "./memo/MemoList";
import { MemoForm } from "./memo/MemoForm";
import { ThemeSwitch } from "./ThemeSwitch";
import { useTheme } from "./useTheme";
import "./App.css";

export default function App() {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [memos, setMemos] = useState<Memo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [theme, setTheme] = useTheme();

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p></p>",
  });

  const reload = async () => {
    setMemos(await apiMemoRepository.findAll());
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
    if (!window.confirm(`「${memo.title}」を削除する？`)) return;
    setStatus("削除中...");
    try {
      await apiMemoRepository.remove(memo.id);
      if (editingId === memo.id) startNew();
      setStatus("削除しました");
      await reload();
    } catch (e) {
      setStatus(`失敗： ${String(e)}`);
    }
  };

  return (
    <div className="page">
      <h1>mosaku</h1>
      <ThemeSwitch theme={theme} onChange={setTheme} />

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

      <h2>保存済み</h2>
      <MemoList
        memos={memos}
        editingId={editingId}
        onOpen={open}
        onRemove={remove}
      />
    </div>
  );
}
