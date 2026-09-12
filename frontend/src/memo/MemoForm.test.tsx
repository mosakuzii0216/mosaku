import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoForm } from "./MemoForm";

const base = {
  title: "",
  status: "",
  isEditing: false,
  onTitleChange: () => {},
  onSave: () => {},
  onNew: () => {},
  children: <div>エディタ</div>,
};

describe("MemoForm", () => {
  it("編集中でなければボタンは「保存」で、「新規」は出ない", () => {
    render(<MemoForm {...base} />);

    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "新規" }),
    ).not.toBeInTheDocument();
  });

  it("編集中ならボタンは「更新」で、「新規」が出る", () => {
    render(<MemoForm {...base} isEditing />);

    expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "新規" })).toBeInTheDocument();
  });

  it("タイトルを打つとonTitleChangeが呼ばれる", async () => {
    const onTitleChange = vi.fn();
    render(<MemoForm {...base} onTitleChange={onTitleChange} />);

    await userEvent.type(screen.getByRole("textbox"), "森");

    expect(onTitleChange).toHaveBeenCalledWith("森");
  });

  it("保存を押すとonSaveが呼ばれる", async () => {
    const onSave = vi.fn();
    render(<MemoForm {...base} onSave={onSave} />);

    await userEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(onSave).toHaveBeenCalled();
  });
});
