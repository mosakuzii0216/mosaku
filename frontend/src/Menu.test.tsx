import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Menu } from "./Menu";

const renderMenu = () =>
  render(
    <div>
      <Menu label="テーマ">
        <button>中身</button>
      </Menu>
      <p>外側</p>
    </div>,
  );

describe("Menu", () => {
  it("最初は閉じていて中身が出ない", () => {
    renderMenu();

    expect(screen.getByRole("button", { name: "テーマ" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(
      screen.queryByRole("button", { name: "中身" }),
    ).not.toBeInTheDocument();
  });

  it("押すと開き、もう一度押すと閉じる", async () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "テーマ" });

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "中身" })).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(
      screen.queryByRole("button", { name: "中身" }),
    ).not.toBeInTheDocument();
  });

  it("中身を押しても閉じない", async () => {
    renderMenu();
    await userEvent.click(screen.getByRole("button", { name: "テーマ" }));

    await userEvent.click(screen.getByRole("button", { name: "中身" }));

    expect(screen.getByRole("button", { name: "中身" })).toBeInTheDocument();
  });

  it("外側を押すと閉じる", async () => {
    renderMenu();
    await userEvent.click(screen.getByRole("button", { name: "テーマ" }));

    await userEvent.click(screen.getByText("外側"));

    expect(
      screen.queryByRole("button", { name: "中身" }),
    ).not.toBeInTheDocument();
  });

  it("Escで閉じる", async () => {
    renderMenu();
    await userEvent.click(screen.getByRole("button", { name: "テーマ" }));

    await userEvent.keyboard("{Escape}");

    expect(
      screen.queryByRole("button", { name: "中身" }),
    ).not.toBeInTheDocument();
  });
});
