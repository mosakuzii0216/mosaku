import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { MemoSection } from "./memo/MemoSection";
import { TrashSection } from "./memo/TrashSection";
import { MemoForm } from "./memo/MemoForm";
import { AppHeader } from "./AppHeader";
import { useTheme } from "./useTheme";
import { useSearch } from "./memo/useSearch";
import { useTrash } from "./memo/useTrash";
import { useMemos } from "./memo/useMemos";
import type { Memo } from "./memo/types";
import "./App.css";

export default function App() {
  const [theme, setTheme] = useTheme();
  const { query, setQuery, results, isSearching } = useSearch();

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p></p>",
  });

  const m = useMemos(editor);
  const trash = useTrash(m.trashed);

  // 検索結果から開いたら検索を閉じて、エディタに戻す
  const openMemo = (memo: Memo) => {
    m.open(memo);
    setQuery("");
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault(); // ブラウザの「ページ保存」を止める
        void m.save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className="page">
      <AppHeader
        query={query}
        theme={theme}
        onQueryChange={setQuery}
        onThemeChange={setTheme}
        onLogin={m.reload}
      />

      {/* 検索中は結果だけ見せる。hiddenで隠すだけなので書き換えは消えない */}
      <div hidden={isSearching}>
        <MemoForm
          title={m.title}
          status={m.status}
          isEditing={m.editingId !== null}
          onTitleChange={m.setTitle}
          onSave={m.save}
          onNew={m.startNew}
        >
          <EditorContent editor={editor} />
        </MemoForm>
      </div>

      <MemoSection
        memos={m.memos}
        results={results}
        query={query}
        isSearching={isSearching}
        editingId={m.editingId}
        onOpen={openMemo}
        onRemove={m.remove}
      />

      <TrashSection
        memos={m.trashed}
        isOpen={trash.isOpen}
        onToggle={trash.toggle}
        onRestore={m.restore}
        onPurge={m.purge}
      />
    </div>
  );
}
