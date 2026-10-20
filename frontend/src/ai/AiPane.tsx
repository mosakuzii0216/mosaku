type Props = { onClose: () => void };

// 日記の横で、AIと話す席。PCでは日記の右に並べて、狭い画面では全体に重ねる
export function AiPane({ onClose }: Props) {
  return (
    <aside className="ai-pane" aria-label="AIと話す">
      {/* 見出しの並びは、メモ一覧の引き出しとそろえる */}
      <div className="drawer-head">
        <h2>AIと話す</h2>
        <button
          className="ghost-button drawer-close"
          aria-label="AIとの会話を閉じる"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
      <p className="ai-empty">書いた日記について、AIと話せます</p>
    </aside>
  );
}
