import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { apiMemoRepository } from "./memo/apiMemoRepository";

export default function App() {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p></p>",
  });

  const save = async () => {
    if (!editor) return;
    setStatus("保存中...");
    try {
      const memo = await apiMemoRepository.create({
        title,
        content: editor.getJSON(),
      });
      setStatus(`保存しました (${memo.id})`);
    } catch (e) {
      setStatus(`失敗: ${String(e)}`);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: "0 16px" }}>
      <h1>mosaku v2</h1>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル"
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />
      <div style={{ border: "1px solid #ccc", padding: 12, minHeight: 160 }}>
        <EditorContent editor={editor} />
      </div>
      <button onClick={save} style={{ marginTop: 12 }}>
        保存
      </button>
      <p>{status}</p>
    </div>
  );
}
