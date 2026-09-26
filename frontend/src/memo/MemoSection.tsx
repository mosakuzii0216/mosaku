import { MemoList } from "./MemoList";
import type { Memo } from "./types";

type Props = {
  memos: Memo[];
  results: Memo[];
  query: string;
  isSearching: boolean;
  editingId: string | null;
  onQueryChange: (q: string) => void;
  onOpen: (memo: Memo) => void;
  onRemove: (memo: Memo) => void;
};

export function MemoSection({
  memos,
  results,
  query,
  isSearching,
  editingId,
  onQueryChange,
  onOpen,
  onRemove,
}: Props) {
  const shown = isSearching ? results : memos;
  const notFound = isSearching && results.length === 0;

  return (
    <>
      <div className="memo-head">
        <h2>{isSearching ? `「${query.trim()}」の検索結果` : "メモ一覧"}</h2>
        <input
          className="search-input"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="検索"
        />
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
