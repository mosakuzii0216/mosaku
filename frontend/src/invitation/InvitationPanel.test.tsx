import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { InvitationPanel } from "./InvitationPanel";
import type { Invitations } from "./invitationApi";
import userEvent from "@testing-library/user-event";

// 開いたときに読む一覧。まだ使われていないコードと、使われたコード
const list: Invitations = {
  invitations: [
    {
      id: "1",
      code: "ABCD-EFGH",
      expiresAt: "2026-12-09T03:00:00.000Z",
      status: "unused",
    },
    {
      id: "2",
      code: "JKLM-NPQR",
      expiresAt: "2026-12-01T03:00:00.000Z",
      status: "used",
    },
  ],
  remaining: 1,
};

// 本物のAPIの代わり。テストごとに、見たいものだけ差し替える
const base = {
  onLoad: async () => list,
  onCreate: async () => {},
  onRevoke: async () => {},
};

describe("InvitationPanel", () => {
  it("開くと、自分のコードと、いつまで使えるか・使われたかを出す", async () => {
    render(<InvitationPanel {...base} />);

    expect(await screen.findByText("ABCD-EFGH")).toBeInTheDocument();
    expect(screen.getByText("12月9日まで")).toBeInTheDocument();
    expect(screen.getByText("使われた")).toBeInTheDocument();
    expect(screen.getByText("あと1枚")).toBeInTheDocument();
  });

  it("読めなかったら、開き直してもらう", async () => {
    render(
      <InvitationPanel
        {...base}
        onLoad={() => Promise.reject(new Error("offline"))}
      />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("開き直して");
  });

  it("コードを作ると、一覧を読み直す", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const onLoad = vi
      .fn()
      .mockResolvedValueOnce({ invitations: [], remaining: 3 })
      .mockResolvedValueOnce(list);
    render(<InvitationPanel {...base} onLoad={onLoad} onCreate={onCreate} />);

    expect(
      await screen.findByText("まだコードはありません"),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "コードを作る" }));

    expect(onCreate).toHaveBeenCalled();
    expect(await screen.findByText("ABCD-EFGH")).toBeInTheDocument();
  });

  it("あと0枚なら、「コードを作る」は押せない", async () => {
    render(
      <InvitationPanel
        {...base}
        onLoad={async () => ({ ...list, remaining: 0 })}
      />,
    );

    expect(await screen.findByText("あと0枚")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "コードを作る" })).toBeDisabled();
  });

  it("作れなかったら、もう一度押してもらう", async () => {
    render(
      <InvitationPanel
        {...base}
        onCreate={() => Promise.reject(new Error("offline"))}
      />,
    );

    expect(await screen.findByText("ABCD-EFGH")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "コードを作る" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "もう一度押して",
    );
  });

  it("取り消せるのは、まだ使われていないコードだけ", async () => {
    const onRevoke = vi.fn().mockRejectedValue(undefined);
    render(<InvitationPanel {...base} onRevoke={onRevoke} />);

    await userEvent.click(
      await screen.findByRole("button", { name: "ABCD-EFGHを取り消す" }),
    );

    expect(onRevoke).toHaveBeenCalledWith("1");
    expect(
      screen.queryByRole("button", { name: "JKLM-NPQRを取り消す" }),
    ).not.toBeInTheDocument();
  });
});
