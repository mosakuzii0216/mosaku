import { MemoList } from "./MemoList";
import type { Memo } from "./types";

type Props = {
  memos: Memo[];
  results: Memo[];
  query: string;
  isSearching: boolean;
  editingId: string | null;
  onOpen: (memo: Memo) => void;
  onRemove: (memo: Memo) => void;
};

export function MemoSection({
  memos,
  results,
  query,
  isSearching,
  editingId,
  onOpen,
  onRemove,
}: Props) {
  const shown = isSearching ? results : memos;
  const notFound = isSearching && results.length === 0;

  return (
    <>
      <div className="memo-head">
        <h2>{isSearching ? `「${query.trim()}」の検索結果` : "メモ一覧"}</h2>
      </div>

      {notFound ? (
        <p className="empty">見つかりませんでした</p>
      ) : (
        <MemoList
          memos={shown}
          editingId={editingId}
          onOpen={onOpen}
          onRemove={onRemove}
        />
      )}
    </>
  );
}
