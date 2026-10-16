import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoList } from "./MemoList";
import type { Memo } from "./types";

const makeMemo = (id: string, title: string): Memo => ({
  id,
  title,
  content: {},
  createdAt: "2026-09-12T00:00:00.000Z",
  updatedAt: "2026-09-12T00:00:00.000Z",
  trashedAt: null,
  contentText: null,
});

describe("MemoList", () => {
  it("メモのタイトルをボタンとして表示する", () => {
    render(
      <MemoList
        memos={[makeMemo("1", "今日のメモ")]}
        editingId={null}
        onOpen={() => {}}
        onRemove={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "今日のメモ" }),
    ).toBeInTheDocument();
  });

  it("行に、最後に書いた日と本文の書き出しを出す", () => {
    const memo = {
      ...makeMemo("1", "今日のメモ"),
      contentText: "散歩に行った",
    };
    render(
      <MemoList
        memos={[memo]}
        editingId={null}
        onOpen={() => {}}
        onRemove={() => {}}
      />,
    );
    expect(screen.getByText("2026/9/12")).toBeInTheDocument();
    expect(screen.getByText("散歩に行った")).toBeInTheDocument();
  });

  it("編集中のメモにis-editingが付く", () => {
    render(
      <MemoList
        memos={[makeMemo("1", "今日のメモ")]}
        editingId="1"
        onOpen={() => {}}
        onRemove={() => {}}
      />,
    );

    expect(screen.getByRole("listitem")).toHaveClass("is-editing");
  });

  it("削除を押すとonRemoveが呼ばれる", async () => {
    const onRemove = vi.fn();
    const memo = makeMemo("1", "今日のメモ");

    render(
      <MemoList
        memos={[memo]}
        editingId={null}
        onOpen={() => {}}
        onRemove={onRemove}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "今日のメモを削除" }),
    );

    expect(onRemove).toHaveBeenCalledWith(memo);
  });

  it("メモが1つも無ければ、ここに並ぶと案内する", () => {
    render(
      <MemoList
        memos={[]}
        editingId={null}
        onOpen={() => {}}
        onRemove={() => {}}
      />,
    );

    expect(
      screen.getByText("書いたメモは、ここに並びます"),
    ).toBeInTheDocument();
  });
});
