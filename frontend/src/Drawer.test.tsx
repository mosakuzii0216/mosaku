import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Drawer } from "./Drawer";

const renderDrawer = (isOpen: boolean, onClose = () => {}) =>
  render(
    <Drawer isOpen={isOpen} label="メモ一覧" onClose={onClose}>
      <button>中身</button>
    </Drawer>,
  );

describe("Drawer", () => {
  it("閉じているときは中身を出さない", () => {
    renderDrawer(false);

    expect(
      screen.queryByRole("button", { name: "中身" }),
    ).not.toBeInTheDocument();
  });

  it("開いているときは見出しと中身を出す", () => {
    renderDrawer(true);

    expect(
      screen.getByRole("dialog", { name: "メモ一覧" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "メモ一覧" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "中身" })).toBeInTheDocument();
  });

  it("閉じるを押すとonCloseが呼ばれる", async () => {
    const onClose = vi.fn();
    renderDrawer(true, onClose);

    await userEvent.click(
      screen.getByRole("button", { name: "メモ一覧を閉じる" }),
    );

    expect(onClose).toHaveBeenCalled();
  });

  it("奥の幕を押すとonCloseが呼ばれる", async () => {
    const onClose = vi.fn();
    const { container } = renderDrawer(true, onClose);

    await userEvent.click(container.querySelector(".drawer-backdrop"));

    expect(onClose).toHaveBeenCalled();
  });

  it("EscでonCloseが呼ばれる", async () => {
    const onClose = vi.fn();
    renderDrawer(true, onClose);

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });
});
