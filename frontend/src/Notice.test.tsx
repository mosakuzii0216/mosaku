import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Notice } from "./Notice";

describe("Notice", () => {
  it("知らせの分を出す", () => {
    render(<Notice message="うまくいきませんでした" onClose={() => {}} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "うまくいきませんでした",
    );
  });

  it("閉じるを押すとonCloseが呼ばれる", async () => {
    const onClose = vi.fn();
    render(<Notice message="うまくいきませんでした" onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "閉じる" }));

    expect(onClose).toHaveBeenCalled();
  });
});
