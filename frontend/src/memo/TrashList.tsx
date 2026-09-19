import type { Memo } from "./types";

type Props = {
  memos: Memo[];
  onRestore: (memo: Memo) => void;
  onPurge: (memo: Memo) => void;
};

export function TrashList({ memos, onRestore, onPurge }: Props) {
  if (memos.length === 0) {
    return <p className="empty">ゴミ箱は空です</p>;
  }

  return (
    <ul className="memo-list">
      {memos.map((memo) => (
        <li key={memo.id}>
          <span className="memo-open is-trashed">{memo.title || "(無題)"}</span>
          <button
            className="memo-delete"
            onClick={() => onRestore(memo)}
            aria-label={`${memo.title}を復元`}
          >
            復元
          </button>
          <button
            className="memo-delete"
            onClick={() => onPurge(memo)}
            aria-label={`${memo.title}を完全に削除`}
          >
            完全削除
          </button>
        </li>
      ))}
    </ul>
  );
}
