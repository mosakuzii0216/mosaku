import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrashSection } from "./TrashSection";
import type { Memo } from "./types";

const makeMemo = (id: string, title: string): Memo => ({
  id,
  title,
  content: {},
  createdAt: "2026-09-26T00:00:00.000Z",
  updatedAt: "2026-09-26T00:00:00.000Z",
  trashedAt: "2026-09-26T00:00:00.000Z",
  contentText: null,
});

const base = {
  memos: [makeMemo("1", "捨てたメモ")],
  isOpen: false,
  onToggle: () => {},
  onRestore: () => {},
  onPurge: () => {},
};

describe("TrashSection", () => {
  it("閉じているときは件数だけ出して中身は出さない", () => {
    render(<TrashSection {...base} />);

    expect(
      screen.getByRole("button", { name: /ゴミ箱 \(1\)/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText("捨てたメモ")).not.toBeInTheDocument();
  });

  it("開いているときは中身を出す", () => {
    render(<TrashSection {...base} isOpen />);

    expect(screen.getByText("捨てたメモ")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "捨てたメモを復元" }),
    ).toBeInTheDocument();
  });

  it("見出しを押すとonToggleが呼ばれる", async () => {
    const onToggle = vi.fn();
    render(<TrashSection {...base} onToggle={onToggle} />);

    await userEvent.click(screen.getByRole("button", { name: /ゴミ箱/ }));

    expect(onToggle).toHaveBeenCalled();
  });
});
