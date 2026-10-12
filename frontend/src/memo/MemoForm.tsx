import type { ReactNode } from "react";

type Props = {
  date: string;
  title: string;
  status: string;
  isEditing: boolean;
  saving: boolean;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onNew: () => void;
  children: ReactNode;
};

export function MemoForm({
  date,
  title,
  status,
  isEditing,
  saving,
  onTitleChange,
  onSave,
  onNew,
  children,
}: Props) {
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
        <button className="save-button" onClick={onSave} disabled={saving}>
          {isEditing ? "更新" : "保存"}
        </button>
        {isEditing && (
          <button className="ghost-button" onClick={onNew}>
            新規
          </button>
        )}
      </div>
      <p className="memo-status">{status}</p>
    </>
  );
}
