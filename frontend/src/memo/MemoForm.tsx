import type { ReactNode } from "react";

type Props = {
  date: string;
  title: string;
  status: string;
  isEditing: boolean;
  onTitleChange: (title: string) => void;
  onNew: () => void;
  children: ReactNode;
};

export function MemoForm({
  date,
  title,
  status,
  isEditing,
  onTitleChange,
  onNew,
  children,
}: Props) {
  // 保存が終わった知らせにだけ、墨の印を付ける
  const isSaved = status === "保存しました" || status === "更新しました";
  return (
    <>
      <p className="memo-date">{date}</p>
      <input
        className="title-input"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="タイトル"
        maxLength={100}
      />
      <div className="editor">{children}</div>

      <div className="editor-actions">
        {isEditing && (
          <button className="ghost-button" onClick={onNew}>
            新規
          </button>
        )}
      </div>
      {/* 知らせが変わるたびに作り直して、にじむ動きを頭から見せる */}
      <p
        key={status}
        className={isSaved ? "memo-status is-saved" : "memo-status"}
      >
        {status}
      </p>
    </>
  );
}
