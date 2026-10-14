import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
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
import { Notice } from "./Notice";
import type { Memo } from "./memo/types";
import "./App.css";
import { Drawer } from "./Drawer";
import { MemoList } from "./memo/MemoList";

type Props = { loginFailed?: boolean };

export default function App({ loginFailed = false }: Props) {
  const [notice, setNotice] = useState(
    loginFailed
      ? "Googleでログインできませんでした。もう一度お試しください。"
      : "",
  );
  const [theme, setTheme] = useTheme();
  const { query, setQuery, results, isSearching } = useSearch();
  const [isListOpen, setIsListOpen] = useState(false);

  const editor = useEditor({
    // 本文が空のときだけ「ここに書く」を薄く出す。枠が無くても書く場所がわかる
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "ここに書く" }),
    ],
    content: "<p></p>",
  });

  const m = useMemos(editor);
  const trash = useTrash(m.trashed);
  const me = useMe();

  // 開いているメモを書いた日。新しく書くなら今日。例：2026年10月12日(月)
  const editing = m.memos.find((memo) => memo.id === m.editingId);
  const writtenAt = editing ? new Date(editing.createdAt) : new Date();
  const date = writtenAt.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  // 一覧や検索結果から開いたら、検索も引き出しも閉じて、エディタに戻す
  const openMemo = (memo: Memo) => {
    m.open(memo);
    setQuery("");
    setIsListOpen(false);
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
      {/* 引き出しが開いているあいだ、奥は押せないようにする */}
      <div insert={isListOpen}>
        <AppHeader
          query={query}
          theme={theme}
          hasPasskey={me.hasPasskey}
          hasGoogle={me.hasGoogle}
          onQueryChange={setQuery}
          onThemeChange={setTheme}
          onLogin={handleLogin}
          onOpenList={() => setIsListOpen(true)}
          onRegistered={me.reload}
          onLogout={handleLogout}
        />
        {notice && <Notice message={notice} onClose={() => setNotice("")} />}

        {/* 検索中は結果だけ見せる。hiddenで隠すだけなので書き換えは消えない */}
        <div hidden={isSearching}>
          <MemoForm
            date={date}
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

        {/* 検索結果は紙の場所に出す。普段の一覧は引き出しの中 */}
        {isSearching && (
          <MemoSection
            memos={m.memos}
            results={results}
            query={query}
            isSearching={isSearching}
            editingId={m.editingId}
            onOpen={openMemo}
            onRemove={m.remove}
          />
        )}
      </div>

      <Drawer
        isOpen={isListOpen}
        label="メモ一覧"
        onClose={() => setIsListOpen(false)}
      >
        <MemoList
          memos={m.memos}
          editingId={m.editingId}
          onOpen={openMemo}
          onRemove={m.remove}
        />
        <div className="drawer-foot">
          <TrashSection
            memos={m.trashed}
            isOpen={trash.isOpen}
            onToggle={trash.toggle}
            onRestore={m.restore}
            onPurge={m.purge}
          />
        </div>
      </Drawer>
    </div>
  );
}
