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
      const memo = await apiMemoRepository.create({
        title,
        content: editor.getJSON(),
      });
      setStatus(`保存しました (${memo.id})`);
      await reload();
    } catch (e) {
      setStatus(`失敗: ${String(e)}`);
    }
  };

  const open = (memo: Memo) => {
    setTitle(memo.title);
    editor?.commands.setContent(memo.content as never);
    setStatus(`開いた (${memo.id})`);
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
      <button className="save-button" onClick={save}>
        保存
      </button>
      <p className="status">{status}</p>

      <h2>保存済み</h2>
      <ul className="memo-list">
        {memos.map((memo) => (
          <li key={memo.id}>
            <button onClick={() => open(memo)}>{memo.title}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
