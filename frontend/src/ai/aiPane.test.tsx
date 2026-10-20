import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiPane } from "./AiPane";

describe("AiPane", () => {
  it("閉じるを押すとonCloseが呼ばれる", async () => {
    const onClose = vi.fn();
    render(<AiPane onClose={onClose} />);

    await userEvent.click(
      screen.getByRole("button", { name: "AIとの会話を閉じる" }),
    );

    expect(onClose).toHaveBeenCalled();
  });
});
