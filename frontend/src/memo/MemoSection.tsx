import { MemoList } from "./MemoList";
import type { Memo } from "./types";

type Props = {
  results: Memo[];
  query: string;
  editingId: string | null;
  onOpen: (memo: Memo) => void;
  onRemove: (memo: Memo) => void;
};

// 検索結果。検索中だけ紙の場所に出す(普段の一覧は引き出しの中)
export function MemoSection({
  results,
  query,
  editingId,
  onOpen,
  onRemove,
}: Props) {
  return (
    <>
      <div className="memo-head">
        <h2>「{query.trim()}」の検索結果</h2>
      </div>

      {results.length === 0 ? (
        <p className="empty">見つかりませんでした</p>
      ) : (
        <MemoList
          memos={results}
          editingId={editingId}
          onOpen={onOpen}
          onRemove={onRemove}
        />
      )}
    </>
  );
}
