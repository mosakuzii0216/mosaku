import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoForm } from "./MemoForm";

const base = {
  date: "2026年10月12日(月)",
  title: "",
  status: "",
  isEditing: false,
  onTitleChange: () => {},
  onNew: () => {},
  children: <div>エディタ</div>,
};

describe("MemoForm", () => {
  // 自動で保存されるので、保存ボタンは出ない
  it("編集中でなければ「保存」も「新規」も出ない", () => {
    render(<MemoForm {...base} />);

    expect(
      screen.queryByRole("button", { name: "保存" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "新規" }),
    ).not.toBeInTheDocument();
  });

  it("編集中なら「新規」だけが出る", () => {
    render(<MemoForm {...base} isEditing />);

    expect(
      screen.queryByRole("button", { name: "更新" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "新規" })).toBeInTheDocument();
  });

  it("タイトルを打つとonTitleChangeが呼ばれる", async () => {
    const onTitleChange = vi.fn();
    render(<MemoForm {...base} onTitleChange={onTitleChange} />);

    await userEvent.type(screen.getByRole("textbox"), "森");

    expect(onTitleChange).toHaveBeenCalledWith("森");
  });

  it("渡された日付をそのまま出す", () => {
    render(<MemoForm {...base} />);

    expect(screen.getByText("2026年10月12日(月)")).toBeInTheDocument();
  });
});
