import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
  results: [makeMemo("2", "検索で出るメモ")],
  query: "検索",
  editingId: null,
  onOpen: () => {},
  onRemove: () => {},
};

describe("MemoSection", () => {
  it("見出しと検索結果を出す", () => {
    render(<MemoSection {...base} />);

    expect(
      screen.getByRole("heading", { name: "「検索」の検索結果" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "検索で出るメモ" }),
    ).toBeInTheDocument();
  });

  it("検索して0件なら見つからなかったと出す", () => {
    render(<MemoSection {...base} query="無い" results={[]} />);

    expect(screen.getByText("見つかりませんでした")).toBeInTheDocument();
  });
});
