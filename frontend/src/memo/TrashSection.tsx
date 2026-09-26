import { TrashList } from "./TrashList";
import type { Memo } from "./types";

type Props = {
  memos: Memo[];
  isOpen: boolean;
  onToggle: () => void;
  onRestore: (memo: Memo) => void;
  onPurge: (memo: Memo) => void;
};

export function TrashSection({
  memos,
  isOpen,
  onToggle,
  onRestore,
  onPurge,
}: Props) {
  return (
    <>
      <h2>
        <button className="trash-toggle" onClick={onToggle}>
          ゴミ箱 ({memos.length}) {isOpen ? "▲" : "▼"}
        </button>
      </h2>
      {isOpen && (
        <TrashList memos={memos} onRestore={onRestore} onPurge={onPurge} />
      )}
    </>
  );
}
