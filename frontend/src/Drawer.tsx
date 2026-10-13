import { useEffect, type ReactNode } from "react";

type Props = {
  isOpen: boolean;
  label: string;
  onClose: () => void;
  children: ReactNode;
};

// 左から出てくる引き出し。閉じているあいだは何も描かない
export function Drawer({ isOpen, label, onClose, children }: Props) {
  useEffect(() => {
    if (!isOpen) return;

    // Escで閉じる
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    // 閉じたら見張りをやめる
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* 奥を暗くする幕。押すと閉じる */}
      <div className="drawer-backdrop" onClick={onClose} />
      <div
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <div className="drawer-head">
          <h2>{label}</h2>
          {/* 開いたらここに目印を移す。書いている途中のキーボードが引っ込む */}
          <button
            className="ghost-button drawer-close"
            aria-label={`${label}を閉じる`}
            onClick={onClose}
            autoFocus
          >
            閉じる
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
