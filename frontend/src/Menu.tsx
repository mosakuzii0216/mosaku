import { useEffect, useRef, useState } from "react";

type Props = {
  label: string;
  children: ReactNode;
};

// 押すと開くメニューj。中を押しても閉じない(テーマを試し比べられるように)
export function Menu({ label, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // メニューの外を押したら閉じる
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setIsOpen(false);
    };
    // Escで閉じる
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    // 閉じたら見張りをやめる
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="menu" ref={ref}>
      <button
        className="menu-trigger"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        {label}
      </button>
      {isOpen && <div className="menu-panel">{children}</div>}
    </div>
  );
}
