import type { Memo } from "./types";

type Props = {
  memos: Memo[];
  editingId: string | null;
  onOpen: (memo: Memo) => void;
  onRemove: (memo: Memo) => void;
};

export function MemoList({ memos, editingId, onOpen, onRemove }: Props) {
  // 初めて開いた人に、ここが何の場所かを伝える
  if (memos.length === 0) {
    return <p className="empty">書いたメモは、ここに並びます</p>;
  }
  return (
    <ul className="memo-list">
      {memos.map((memo) => (
        <li key={memo.id} className={memo.id === editingId ? "is-editing" : ""}>
          <button
            className="memo-open"
            aria-label={memo.title || "(無題)"}
            onClick={() => onOpen(memo)}
          >
            <span className="memo-title">{memo.title || "(無題)"}</span>
            {/* 最後に書いた日と、本文の書き出し。一覧は最後に書いた順なので、日付もその順に並ぶ */}
            <span className="memo-meta">
              <time dateTime={memo.updatedAt}>
                {new Date(memo.updatedAt).toLocaleDateString("ja-JP")}
              </time>
              {memo.contentText}
            </span>
          </button>
          <button
            className="memo-delete"
            onClick={() => onRemove(memo)}
            aria-label={`${memo.title}を削除`}
          >
            削除
          </button>
        </li>
      ))}
    </ul>
  );
}
