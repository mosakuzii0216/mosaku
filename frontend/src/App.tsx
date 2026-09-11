import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { apiMemoRepository } from "./memo/apiMemoRepository";
import type { Memo } from "./memo/types";
import "./App.css";
import {
  THEMES,
  THEME_LABELS,
  readTheme,
  applyTheme,
  type Theme,
} from "./theme";

export default function App() {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [memos, setMemos] = useState<Memo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

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
      <div className="theme-switch">
        {THEMES.map((t) => (
          <button
            key={t}
            className={t === theme ? "is-active" : ""}
            onClick={() => setTheme(t)}
          >
            {THEME_LABELS[t]}
          </button>
        ))}
      </div>
      <input
        className="title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル"
      />
      <div className="editor">
        <EditorContent editor={editor} />
      </div>

      <div className="editor-actions">
        <button className="save-button" onClick={save}>
          {editingId ? "更新" : "保存"}
        </button>
        {editingId && (
          <button className="ghost-button" onClick={startNew}>
            新規
          </button>
        )}
      </div>
      <p className="status">{status}</p>

      <h2>保存済み</h2>
      <ul className="memo-list">
        {memos.map((memo) => (
          <li
            key={memo.id}
            className={memo.id === editingId ? "is-editing" : ""}
          >
            <button className="memo-open" onClick={() => open(memo)}>
              {memo.title || "(無題)"}
            </button>
            <button
              className="memo-delete"
              onClick={() => remove(memo)}
              aria-label={`${memo.title}を削除`}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
