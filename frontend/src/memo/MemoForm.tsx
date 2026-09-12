import type { ReactNode } from "react";

type Props = {
  title: string;
  status: string;
  isEditing: boolean;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onNew: () => void;
  children: ReactNode;
};

export function MemoForm({
  title,
  status,
  isEditing,
  onTitleChange,
  onSave,
  onNew,
  children,
}: Props) {
  return (
    <>
      <input
        className="title-input"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="タイトル"
      />
      <div className="editor">{children}</div>

      <div className="editor-actions">
        <button className="save-button" onClick={onSave}>
          {isEditing ? "更新" : "保存"}
        </button>
        {isEditing && (
          <button className="ghost-button" onClick={onNew}>
            新規
          </button>
        )}
      </div>
      <p className="status">{status}</p>
    </>
  );
}
