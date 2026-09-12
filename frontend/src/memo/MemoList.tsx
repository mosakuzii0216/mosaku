import type { Memo } from "./types";

type Props = {
  memos: Memo[];
  editingId: string | null;
  onOpen: (memo: Memo) => void;
  onRemove: (memo: Memo) => void;
};

export function MemoList({ memos, editingId, onOpen, onRemove }: Props) {
  return (
    <ul className="memo-list">
      {memos.map((memo) => (
        <li key={memo.id} className={memo.id === editingId ? "is-editing" : ""}>
          <button className="memo-open" onClick={() => onOpen(memo)}>
            {memo.title || "(無題)"}
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
