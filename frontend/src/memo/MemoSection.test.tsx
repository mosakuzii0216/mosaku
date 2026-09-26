import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoSection } from "./MemoSection";
import type { Memo } from "./types";

const makeMemo = (id: string, title: string): Memo => ({
  id,
  title,
  content: {},
  createdAt: "2026-09-25T00:00:00.000Z",
  updatedAt: "2026-09-25T00:00:00.000Z",
  trashedAt: null,
  contentText: null,
});

const base = {
  memos: [makeMemo("1", "普段のメモ")],
  results: [makeMemo("2", "検索で出るメモ")],
  query: "",
  isSearching: false,
  editingId: null,
  onQueryChange: () => {},
  onOpen: () => {},
  onRemove: () => {},
};

describe("MemoSection", () => {
  it("検索していないときは保存済みの一覧を出す", () => {
    render(<MemoSection {...base} />);

    expect(
      screen.getByRole("heading", { name: "メモ一覧" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "普段のメモ" }),
    ).toBeInTheDocument();
  });

  it("検索中は検索結果を出す", () => {
    render(<MemoSection {...base} query="検索" isSearching />);

    expect(
      screen.getByRole("button", { name: "検索で出るメモ" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "普段のメモ" }),
    ).not.toBeInTheDocument();
  });

  it("検索して0件なら見つからなかったと出す", () => {
    render(<MemoSection {...base} query="無い" isSearching results={[]} />);

    expect(screen.getByText("見つかりませんでした")).toBeInTheDocument();
  });

  it("検索欄に打つとonQueryChangeが呼ばれる", async () => {
    const onQueryChange = vi.fn();
    render(<MemoSection {...base} onQueryChange={onQueryChange} />);

    await userEvent.type(screen.getByRole("searchbox"), "森");

    expect(onQueryChange).toHaveBeenCalledWith("森");
  });
});
