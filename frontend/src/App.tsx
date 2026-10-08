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
import { useMe } from "./auth/useMe";
import { logout } from "./auth/meApi";
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
  const me = useMe();

  // 検索結果から開いたら検索を閉じて、エディタに戻す
  const openMemo = (memo: Memo) => {
    m.open(memo);
    setQuery("");
  };

  // パスキーでログインしたら、メモも登録状態も読み直す
  const handleLogin = () => {
    void m.reload();
    void me.reload();
  };

  // ログアウトしたら、名札が無い状態から読み直す(新しい匿名ユーザになる)
  const handleLogout = async () => {
    await logout();
    window.location.reload();
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
        hasPasskey={me.hasPasskey}
        hasGoogle={me.hasGoogle}
        onQueryChange={setQuery}
        onThemeChange={setTheme}
        onLogin={handleLogin}
        onRegistered={me.reload}
        onLogout={handleLogout}
      />

      {/* 検索中は結果だけ見せる。hiddenで隠すだけなので書き換えは消えない */}
      <div hidden={isSearching}>
        <MemoForm
          title={m.title}
          status={m.status}
          isEditing={m.editingId !== null}
          saving={m.saving}
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
