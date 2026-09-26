import { useState } from "react";
import type { Memo } from "./types";

export function useTrash(trashed: Memo[]) {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    toggle: () => setIsOpen((v) => !v),
    count: trashed.length,
  };
}
